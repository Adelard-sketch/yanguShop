const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
  phone: String,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isAgentApproved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
