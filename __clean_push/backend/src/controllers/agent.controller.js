const Agent = require('../models/Agent');
const User = require('../models/User');
const Promo = require('../models/Promo');
const { sendEmail } = require('../services/notification.service');

// Generate a unique promo code
const generatePromoCode = (name) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  const randomNum = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AGENT-${initials}-${randomNum}`;
};

// Admin: Create agent with auto-generated promo code
exports.create = async (req, res, next) => {
  try {
    const { name, email, phone, address, whatsapp, password } = req.body;

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
    }

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    // Check if a regular user exists with this email
    const existingUser = await User.findOne({ email });

    // If a user exists, create an agent application linked to that user (pending approval)
    if (existingUser) {
      const agent = await Agent.create({
        userId: existingUser._id,
        name,
        email,
        phone,
        address: address || '',
        whatsapp: whatsapp || phone,
        occupation: req.body.occupation || '',
        socialLinks: Array.isArray(req.body.socialLinks) ? req.body.socialLinks : (req.body.socialLinks ? req.body.socialLinks.split(',').map(s=>s.trim()).filter(Boolean) : []),
        status: 'pending',
        active: false,
        commissionRate: 10,
      });

      // mark user as not yet approved as agent
      existingUser.isAgentApproved = false;
      await existingUser.save();

      // notify user that application was received
      try {
        await sendEmail({
          to: email,
          subject: 'Agent Application Received',
          html: `<p>Hi ${existingUser.name || name},</p><p>We received your application to become an agent. Our team will review your details and contact you shortly.</p>`
        });
      } catch (e) {
        console.error('Failed to send application email:', e);
      }

      return res.status(201).json({ message: 'Agent application submitted (pending approval)', agent });
    }

    // If no user exists, create a user account with provided password (or temp) and create pending agent
    const promoCode = generatePromoCode(name);
    const tempPassword = password || require('crypto').randomBytes(8).toString('hex');
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hash,
      role: 'agent',
      isVerified: true,
      isAgentApproved: false,
    });

    const agent = await Agent.create({
      userId: user._id,
      name,
      email,
      phone,
      address: address || '',
      whatsapp: whatsapp || phone,
      occupation: req.body.occupation || '',
      socialLinks: Array.isArray(req.body.socialLinks) ? req.body.socialLinks : (req.body.socialLinks ? req.body.socialLinks.split(',').map(s=>s.trim()).filter(Boolean) : []),
      status: 'pending',
      active: false,
      commissionRate: 10,
    });

    // Send application received email (include temp password only if we generated it)
    try {
      await sendEmail({
        to: email,
        subject: 'Agent Application Received',
        html: `
          <p>Hi ${name},</p>
          <p>Thank you for applying to become an agent on YanguShop. Your application is under review by our team.</p>
          ${password ? '' : `<p>Your temporary password: <strong>${tempPassword}</strong></p><p>Please wait for admin approval before logging in as an agent.</p>`}
        `
      });
    } catch (e) {
      console.error('Failed to send application email:', e);
    }

    return res.status(201).json({ message: 'Agent application submitted (pending approval)', agent });
  } catch (err) { next(err); }
};

// Admin: create and immediately approve an agent
exports.createByAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, address, city, state, businessName, businessRegistration, nationalId, commissionRate } = req.body;

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent with this email already exists' });
    }

    const agent = await Agent.create({
      name,
      email,
      phone,
      address,
      city,
      state,
      businessName,
      businessRegistration,
      nationalId,
      status: 'approved',
      active: true,
      approvedBy: req.user.id,
      approvedAt: new Date(),
      commissionRate: commissionRate || 0,
    });

    res.status(201).json({ message: 'Agent created and approved', agent });
  } catch (err) { next(err); }
};

// Admin: Get all agents with filters
exports.list = async (req, res, next) => {
  try {
    const { status, active } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (active !== undefined) filter.active = active === 'true';

    const agents = await Agent.find(filter).select('-nationalId').populate('approvedBy', 'name email');
    
    // Fetch promo codes for each agent
    const agentsWithPromos = await Promise.all(
      agents.map(async (agent) => {
        try {
          const promo = await Promo.findOne({ agentId: agent._id });
          return {
            ...agent.toObject(),
            code: promo?.code || null
          };
        } catch (err) {
          console.error(`Error fetching promo for agent ${agent._id}:`, err);
          return {
            ...agent.toObject(),
            code: null
          };
        }
      })
    );
    
    res.json(agentsWithPromos);
  } catch (err) { 
    console.error('Error in agents list:', err);
    next(err); 
  }
};

// Admin: Get single agent details
exports.get = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id).populate('approvedBy', 'name email');
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (err) { next(err); }
};

// Agent: Get public profile (or for agent themselves)
exports.getProfile = async (req, res, next) => {
  try {
    const id = req.params.id || req.user?.id;
    const agent = await Agent.findById(id).populate('approvedBy', 'name email');
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    next(err);
  }
};

// Admin: Approve agent
exports.approve = async (req, res, next) => {
  try {
    const { reason, promoId, promo } = req.body;
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    agent.status = 'approved';
    agent.active = true;
    agent.approvedBy = req.user.id;
    agent.approvedAt = new Date();
    await agent.save();

    // If there's a linked user, set their role to 'agent'. Otherwise, if a user exists with agent email, set that role too.
    let user = null;
    if (agent.userId) {
      user = await User.findById(agent.userId);
    }
    if (!user) {
      user = await User.findOne({ email: agent.email });
    }
    if (user) {
      user.role = 'agent';
      user.isAgentApproved = true;
      user.isVerified = true;
      await user.save();
    }

    // Promo handling: admin can provide promoId to assign an existing promo, or provide a promo object to create one with custom fields.
    let promoRecord = null;
    let promoCode = null;

    if (promoId) {
      // assign an existing promo to this agent
      promoRecord = await Promo.findById(promoId);
      if (!promoRecord) return res.status(404).json({ message: 'Promo not found' });
      promoRecord.agentId = agent._id;
      promoRecord.assignedToAgent = agent._id;
      promoRecord.active = true;
      await promoRecord.save();
      promoCode = promoRecord.code;
    } else if (promo && promo.code) {
      // create promo with provided details
      const newPromoData = {
        code: promo.code,
        description: promo.description || `Promo for agent ${agent.name}`,
        discount: promo.discount ?? 20,
        discountType: promo.discountType || 'percentage',
        agentId: agent._id,
        assignedToAgent: agent._id,
        createdBy: req.user?.id,
        active: promo.active !== undefined ? promo.active : true,
        firstTimeCustomersOnly: promo.firstTimeCustomersOnly || true,
        maxUses: promo.maxUses !== undefined ? promo.maxUses : -1,
        startsAt: promo.startsAt,
        endsAt: promo.endsAt,
      };
      promoRecord = await Promo.create(newPromoData);
      promoCode = promoRecord.code;
    } else {
      // ensure the agent has a promo code (existing or auto-generated)
      promoRecord = await Promo.findOne({ agentId: agent._id });
      if (!promoRecord) {
        promoCode = generatePromoCode(agent.name || (user && user.name) || 'AG');
        promoRecord = await Promo.create({
          code: promoCode,
          discount: 20,
          discountType: 'percentage',
          agentId: agent._id,
          createdBy: req.user?.id,
          active: true,
          firstTimeCustomersOnly: true,
          maxUses: -1,
        });
      } else {
        promoCode = promoRecord.code;
      }
    }

    // Send approval email with promo code
    try {
      await sendEmail({
        to: agent.email,
        subject: 'Agent Application Approved',
        html: `
          <h3>Congratulations ${agent.name || (user && user.name) || ''}!</h3>
          <p>Your agent application has been approved. You can now start selling on YanguShop.</p>
          <p><strong>Your Promo Code:</strong> ${promoCode}</p>
          <p>Share this with customers to give them a discount and start earning commissions.</p>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send approval email:', emailErr);
    }

    res.json({ message: 'Agent approved', agent, promoCode });
  } catch (err) { next(err); }
};

// Admin: Reject agent
exports.reject = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) return res.status(400).json({ message: 'Rejection reason is required' });

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        active: false,
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    // Send rejection email
    await sendEmail(agent.email, 'Agent Application Rejected', `Your agent application has been rejected. Reason: ${reason}`);

    res.json({ message: 'Agent rejected', agent });
  } catch (err) { next(err); }
};

// Admin: Update agent details
exports.update = async (req, res, next) => {
  try {
    const { commissionRate, notes } = req.body;

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { commissionRate, notes },
      { new: true, runValidators: true }
    );

    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    res.json({ message: 'Agent updated', agent });
  } catch (err) { next(err); }
};

// Admin: Deactivate agent
exports.deactivate = async (req, res, next) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    agent.active = false;
    agent.status = 'inactive';
    agent.deactivatedAt = new Date();
    await agent.save();

    res.json({ message: 'Agent deactivated', agent });
  } catch (err) {
    next(err);
  }
};

