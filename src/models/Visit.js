const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  path: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  country: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Visit', VisitSchema);
