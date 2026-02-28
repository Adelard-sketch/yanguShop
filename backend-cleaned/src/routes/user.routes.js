const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');

router.get('/me', auth, userCtrl.getProfile);
// Admin user management
router.get('/', auth, roleCheck('admin'), userCtrl.list);
router.get('/:id', auth, roleCheck('admin'), userCtrl.get);

module.exports = router;
