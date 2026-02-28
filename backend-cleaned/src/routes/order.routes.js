const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');

// User routes
router.post('/', auth, orderCtrl.create);
// Dev/Admin: test notify for an existing order (requires admin)
router.post('/test-notify', auth, roleCheck('admin'), orderCtrl.testNotify);
// Dev-only public test (disabled in production)
router.post('/test-notify-public', orderCtrl.testNotifyPublic);
router.get('/user/my-orders', auth, orderCtrl.getUserOrders);
router.get('/:id', auth, orderCtrl.get);

// Admin only routes
router.get('/', auth, roleCheck('admin'), orderCtrl.getAllOrders);
router.get('/stats/overview', auth, roleCheck('admin'), orderCtrl.getOrderStats);
router.put('/:id/status', auth, roleCheck('admin'), orderCtrl.updateOrderStatus);
router.get('/shop/:shopId', auth, roleCheck('admin'), orderCtrl.getShopOrders);

module.exports = router;
