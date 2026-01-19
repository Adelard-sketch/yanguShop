const User = require('../models/User');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};

// Admin: list users with pagination and filters
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (q) filter.$or = [ { name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } } ];

    const users = await User.find(filter).select('-password').limit(parseInt(limit)).skip(parseInt(skip)).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);

    res.json({ data: users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// Admin: get single user
exports.get = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};
