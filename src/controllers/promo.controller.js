const Promo = require('../models/Promo');
const Agent = require('../models/Agent');

exports.create = async (req, res, next) => {
  try {
    const { code, description, discountPercent, startsAt, endsAt } = req.body;
    const promo = await Promo.create({ code, description, discountPercent, startsAt, endsAt });
    res.status(201).json(promo);
  } catch (err) { next(err); }
};

exports.assignToAgent = async (req, res, next) => {
  try {
    // route may be /agents/:id/promos/:promoId/assign or /promos/:promoId/assign with agentId in body
    const promoId = req.params.promoId || req.params.id;
    const agentId = req.params.id || req.params.agentId || req.body.agentId;

    const promo = await Promo.findById(promoId);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });

    const agent = await Agent.findById(agentId);
    if (!agent) return res.status(404).json({ message: 'Agent not found' });

    promo.assignedToAgent = agent._id;
    promo.agentId = agent._id;
    promo.active = true;
    await promo.save();

    res.json({ message: 'Promo assigned to agent', promo });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const promos = await Promo.find().populate('assignedToAgent', 'name email');
    res.json(promos);
  } catch (err) { next(err); }
};
