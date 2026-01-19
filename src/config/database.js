const mongoose = require('mongoose');
const logger = require('../utils/logger');

async function connect(uri, opts = {}) {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, ...opts });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error', err);
    throw err;
  }
}

module.exports = { connect };
