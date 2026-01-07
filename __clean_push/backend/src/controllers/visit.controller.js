const Visit = require('../models/Visit');

// Record a visit
exports.create = async (req, res, next) => {
  try {
    const { path, country } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    const v = await Visit.create({ path, ip, userAgent, country });
    res.status(201).json(v);
  } catch (err) { next(err); }
};

// Optional: list recent visits (admin)
exports.list = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const items = await Visit.find().sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json(items);
  } catch (err) { next(err); }
};
