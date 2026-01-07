const Order = require('../models/Order');

// User: Create new order
exports.create = async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, user: req.user.id });
    res.status(201).json(order);
  } catch (err) { next(err); }
};

// User: Get their own order
exports.get = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .populate('shop', 'name');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if user owns this order
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) { next(err); }
};

// User: Get their orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price')
      .populate('shop', 'name')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) { next(err); }
};

// Admin: Get all orders with filters
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, shop, startDate, endDate, limit = 20, page = 1 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (shop) filter.shop = shop;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .populate('shop', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) { next(err); }
};

// Admin: Get order statistics
exports.getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch (err) { next(err); }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email phone');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: 'Order status updated', order });
  } catch (err) { next(err); }
};

// Admin: Get orders by shop
exports.getShopOrders = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { status, limit = 20, page = 1 } = req.query;
    const filter = { shop: shopId };

    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (err) { next(err); }
};
