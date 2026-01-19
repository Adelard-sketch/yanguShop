const mongoose = require('mongoose');

const PromoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discount: { type: Number, default: 0 }, // discount percentage or amount
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountPercent: { type: Number, default: 0 }, // kept for backward compatibility
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  active: { type: Boolean, default: true },
  firstTimeCustomersOnly: { type: Boolean, default: false },
  maxUses: { type: Number, default: -1 }, // -1 = unlimited
  usageCount: { type: Number, default: 0 },
  startsAt: Date,
  endsAt: Date,
  assignedToAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }, // kept for backward compatibility
}, { timestamps: true });

module.exports = mongoose.model('Promo', PromoSchema);
