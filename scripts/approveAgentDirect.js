const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const Agent = require('../src/models/Agent');
const User = require('../src/models/User');
const Promo = require('../src/models/Promo');
const { MONGO_URI } = require('../src/config/env');

const generatePromoCode = (name) => {
  const initials = (name || 'AG')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  const randomNum = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AGENT-${initials}-${randomNum}`;
};

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const agentId = process.argv[2] || '695ce352a7630da626604e78';
    const adminId = null; // optional

    const agent = await Agent.findById(agentId);
    if (!agent) return console.error('Agent not found');

    agent.status = 'approved';
    agent.active = true;
    agent.approvedBy = adminId;
    agent.approvedAt = new Date();
    await agent.save();

    let user = null;
    if (agent.userId) user = await User.findById(agent.userId);
    if (!user) user = await User.findOne({ email: agent.email });
    if (user) {
      user.role = 'agent';
      await user.save();
      console.log('User role set to agent for', user.email);
    }

    let promo = await Promo.findOne({ agentId: agent._id });
    let promoCode = promo?.code;
    if (!promo) {
      promoCode = generatePromoCode(agent.name || (user && user.name) || 'AG');
      promo = await Promo.create({
        code: promoCode,
        discount: 20,
        discountType: 'percentage',
        agentId: agent._id,
        createdBy: adminId,
        active: true,
        firstTimeCustomersOnly: true,
        maxUses: -1,
      });
      console.log('Created promo', promoCode);
    } else {
      console.log('Promo already exists:', promoCode);
    }

    console.log('Agent approved:', agent._id.toString());
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
