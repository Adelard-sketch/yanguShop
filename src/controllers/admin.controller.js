const Order = require('../models/Order');
const User = require('../models/User');
const Visit = require('../models/Visit');

// Admin dashboard summary: sales and traffic
exports.dashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueAgg = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Visits in last 30 days
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const visits = await Visit.countDocuments({ createdAt: { $gte: since } });

    res.json({ totalUsers, totalOrders, totalRevenue, visitsLast30Days: visits });
  } catch (err) { next(err); }
};
