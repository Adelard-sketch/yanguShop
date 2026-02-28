const Payment = require('../models/Payment');
const paymentService = require('../services/payment.service');

exports.initiate = async (req, res, next) => {
  try {
    const result = await paymentService.initiate(req.body, req.user);
    res.json(result);
  } catch (err) { next(err); }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const p = await Payment.findById(id);
    if (!p) return res.status(404).json({ message: 'Payment not found' });
    res.json({ id: p._id, status: p.status, provider: p.provider, providerRef: p.providerRef });
  } catch (err) { next(err); }
};

// Webhook endpoint for Flutterwave
exports.webhook = async (req, res, next) => {
  try {
    const signature = req.headers['verif-hash'] || req.headers['verification'];
    const raw = JSON.stringify(req.body);

    const ok = paymentService.verifyFlutterwaveSignature(raw, signature);
    if (!ok) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = req.body;
    const tx_ref = event?.data?.tx_ref || event?.data?.flw_ref || null;
    const status = event?.data?.status || event?.event || null;

    if (!tx_ref) return res.status(200).send('ignored');

    const paid = (status === 'successful' || status === 'successful' || status === 'completed');

    const payment = await paymentService.findAndUpdateByTxRef(tx_ref, {
      status: paid ? 'paid' : 'failed',
      providerData: event
    });

    // If payment references an order, update its status to 'paid' (or 'payment_failed')
    if (payment && payment.order) {
      const Order = require('../models/Order');
      try {
        await Order.findByIdAndUpdate(payment.order, { status: paid ? 'paid' : 'payment_failed' });
      } catch (e) {
        // log but don't fail webhook
        console.error('Failed to update order status for payment webhook', e.message || e);
      }
    }

    res.json({ received: true });
  } catch (err) { next(err); }
};

// Admin: Get all payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, method, startDate, endDate, limit = 50, page = 1 } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (method) query.method = method;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const payments = await Payment.find(query)
      .populate('order', 'total status')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Payment.countDocuments(query);
    
    res.json({
      payments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) { next(err); }
};

// Admin: Get payment stats
exports.getPaymentStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const stats = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    const byMethod = await Payment.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({ byStatus: stats, byMethod });
  } catch (err) { next(err); }
};

// Admin: Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('order').populate('user', 'name email');
    
    res.json(payment);
  } catch (err) { next(err); }
};
