const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  whatsapp: String,
  address: String,
  city: String,
  state: String,
  bankAccount: String,
  bankCode: String,
  businessName: String,
  businessRegistration: String,
  nationalId: String,
  profileImage: String,
  occupation: String,
  socialLinks: [String],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,
  active: { type: Boolean, default: false },
  commissionRate: { type: Number, default: 10 },
  totalOrders: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
