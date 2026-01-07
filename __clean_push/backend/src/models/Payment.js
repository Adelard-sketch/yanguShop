const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  provider: String,
  providerRef: String,
  providerData: Object,
  currency: { type: String, default: 'UGX' },
  amount: Number,
  status: { type: String, default: 'initiated' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
