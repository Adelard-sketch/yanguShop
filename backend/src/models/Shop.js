const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
  name: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  location: String,
}, { timestamps: true });

module.exports = mongoose.model('Shop', ShopSchema);
