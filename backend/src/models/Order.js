const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, qty: Number }],
  total: Number,
  status: { type: String, default: 'pending' },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
