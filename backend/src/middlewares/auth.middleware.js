const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('auth header:', authHeader && authHeader.slice(0,50));
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('auth payload:', payload && { id: payload.id, role: payload.role });
    // keep both `id` and `_id` to support older code
    payload._id = payload.id;
    req.user = payload;
    next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
};
