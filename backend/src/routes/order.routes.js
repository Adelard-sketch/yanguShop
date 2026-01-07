const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');

// User routes
router.post('/', auth, orderCtrl.create);
router.get('/user/my-orders', auth, orderCtrl.getUserOrders);
router.get('/:id', auth, orderCtrl.get);

// Admin only routes
router.get('/', auth, roleCheck('admin'), orderCtrl.getAllOrders);
router.get('/stats/overview', auth, roleCheck('admin'), orderCtrl.getOrderStats);
router.put('/:id/status', auth, roleCheck('admin'), orderCtrl.updateOrderStatus);
router.get('/shop/:shopId', auth, roleCheck('admin'), orderCtrl.getShopOrders);

module.exports = router;
