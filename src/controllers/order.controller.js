const Order = require('../models/Order');
const notificationService = require('../services/notification.service');
const whatsappService = require('../services/whatsapp.service');

// User: Create new order
exports.create = async (req, res, next) => {
  try {
    const order = await Order.create({ ...req.body, user: req.user.id });

    // populate order with user, shop and shop owner for notifications
    const fullOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .populate({ path: 'shop', populate: { path: 'owner', select: 'name email phone' } });

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const orderUrl = `${frontend.replace(/\/$/, '')}/orders/${fullOrder._id}`;

    // Prepare messages
    const custName = fullOrder.user?.name || 'Customer';
    const customerEmailHtml = `
      <p>Hi ${custName},</p>
      <p>Thank you for your order. Order <strong>#${fullOrder._id}</strong> has been received.</p>
      <p>Total: <strong>${fullOrder.total}</strong></p>
      <p>Status: <strong>${fullOrder.status}</strong></p>
      <p><a href="${orderUrl}">View your order</a></p>
    `;

    const customerWhatsappMsg = `Hi ${custName}, we received your order #${fullOrder._id}. Total: ${fullOrder.total}. Track: ${orderUrl}`;

    // Send notifications (best-effort)
    (async () => {
      try {
        if (fullOrder.user?.email) {
          await notificationService.sendEmail({ to: fullOrder.user.email, subject: `Order Received - ${fullOrder._id}`, html: customerEmailHtml });
        }
      } catch (e) { console.error('Failed to send order email to customer:', e); }

      try {
        if (fullOrder.user?.phone) {
          await whatsappService.send(fullOrder.user.phone, customerWhatsappMsg);
        }
      } catch (e) { console.error('Failed to send WhatsApp to customer:', e); }

      // create DB notification for customer
      try {
        await notificationService.create({ user: fullOrder.user._id, message: `Order ${fullOrder._id} received` });
      } catch (e) { console.error('Failed to create DB notification for customer:', e); }

      // Notify shop owner/manager if present
      try {
        const owner = fullOrder.shop?.owner;
        if (owner) {
          const ownerName = owner.name || 'Manager';
          const ownerEmailHtml = `
            <p>Hi ${ownerName},</p>
            <p>A new order <strong>#${fullOrder._id}</strong> was placed for your shop <strong>${fullOrder.shop?.name || ''}</strong>.</p>
            <p>Total: <strong>${fullOrder.total}</strong></p>
            <p><a href="${orderUrl}">View order</a></p>
          `;

          const ownerWhatsappMsg = `New order #${fullOrder._id} for ${fullOrder.shop?.name || ''}. Total: ${fullOrder.total}. ${orderUrl}`;

          if (owner.email) {
            await notificationService.sendEmail({ to: owner.email, subject: `New order received - ${fullOrder._id}`, html: ownerEmailHtml });
          }

          if (owner.phone) {
            await whatsappService.send(owner.phone, ownerWhatsappMsg);
          }

          try {
            await notificationService.create({ user: owner._id, message: `New order ${fullOrder._id} placed` });
          } catch (e) { console.error('Failed to create DB notification for owner:', e); }
        }
      } catch (e) { console.error('Failed to notify shop owner:', e); }
    })();

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

// Admin: trigger notifications for an existing order (testing)
exports.testNotify = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId required' });

    const fullOrder = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price')
      .populate({ path: 'shop', populate: { path: 'owner', select: 'name email phone' } });

    if (!fullOrder) return res.status(404).json({ message: 'Order not found' });

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
    const orderUrl = `${frontend.replace(/\/$/, '')}/orders/${fullOrder._id}`;

    const custName = fullOrder.user?.name || 'Customer';
    const customerEmailHtml = `
      <p>Hi ${custName},</p>
      <p>Your order <strong>#${fullOrder._id}</strong> details.</p>
      <p>Total: <strong>${fullOrder.total}</strong></p>
      <p><a href="${orderUrl}">View order</a></p>
    `;
    const customerWhatsappMsg = `Hi ${custName}, update on your order #${fullOrder._id}. ${orderUrl}`;

    try {
      if (fullOrder.user?.email) await notificationService.sendEmail({ to: fullOrder.user.email, subject: `Order Update - ${fullOrder._id}`, html: customerEmailHtml });
    } catch (e) { console.error('testNotify: failed to email customer', e); }

    try {
      if (fullOrder.user?.phone) await whatsappService.send(fullOrder.user.phone, customerWhatsappMsg);
    } catch (e) { console.error('testNotify: failed to whatsapp customer', e); }

    try { await notificationService.create({ user: fullOrder.user._id, message: `Order ${fullOrder._id} update` }); } catch (e) { console.error(e); }

    // notify owner
    try {
      const owner = fullOrder.shop?.owner;
      if (owner) {
        const ownerEmailHtml = `<p>New notification for order <strong>#${fullOrder._id}</strong></p><p><a href="${orderUrl}">View order</a></p>`;
        if (owner.email) await notificationService.sendEmail({ to: owner.email, subject: `Order Notification - ${fullOrder._id}`, html: ownerEmailHtml });
        if (owner.phone) await whatsappService.send(owner.phone, `Order ${fullOrder._id} update: ${orderUrl}`);
        try { await notificationService.create({ user: owner._id, message: `Order ${fullOrder._id} update` }); } catch (e) { console.error(e); }
      }
    } catch (e) { console.error('testNotify: notify owner failed', e); }

    res.json({ message: 'Notifications triggered (best-effort)' });
  } catch (err) { next(err); }
};

// Public dev-only notifier: accepts { toPhone, email, subject, message }
exports.testNotifyPublic = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Not allowed in production' });
    }

    const { toPhone, email, subject, message } = req.body;
    if (!toPhone && !email) return res.status(400).json({ message: 'toPhone or email required' });

    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

    // send email
    if (email) {
      try {
        await notificationService.sendEmail({ to: email, subject: subject || 'Test Notification', html: message || '<p>Test message</p>' });
      } catch (e) { console.error('testNotifyPublic: email send failed', e); }
    }

    // send whatsapp
    if (toPhone) {
      try {
        await whatsappService.send(toPhone, message || 'Test notification from YanguShop');
      } catch (e) { console.error('testNotifyPublic: whatsapp send failed', e); }
    }

    // create a generic DB notification (no user)
    try { await notificationService.create({ message: `Test notification: ${message || ''}` }); } catch (e) { console.error(e); }

    res.json({ message: 'Test notification processed (best-effort)' });
  } catch (err) { next(err); }
};
