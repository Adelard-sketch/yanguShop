const mongoose = require('mongoose');

const TwilioMessageSchema = new mongoose.Schema({
  sid: { type: String, index: true },
  from: String,
  to: String,
  body: String,
  status: String,
  direction: { type: String, enum: ['inbound','outbound'], default: 'outbound' },
  errorCode: Number,
  raw: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('TwilioMessage', TwilioMessageSchema);
