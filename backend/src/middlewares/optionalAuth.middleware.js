const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

module.exports = function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    req.user = null;
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    payload._id = payload.id;
    req.user = payload;
    return next();
  } catch (err) {
    // If token invalid, treat as anonymous rather than failing
    req.user = null;
    return next();
  }
};
