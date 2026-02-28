const express = require('express');
const router = express.Router();
const paymentCtrl = require('../controllers/payment.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');

// User routes
router.post('/initiate', auth, paymentCtrl.initiate);
// Webhook (provider) - no auth
router.post('/webhook', paymentCtrl.webhook);
// Payment status check
router.get('/:id/status', auth, paymentCtrl.getPaymentStatus);

// Admin routes
router.get('/stats/overview', auth, roleCheck('admin'), paymentCtrl.getPaymentStats);
router.put('/:id/status', auth, roleCheck('admin'), paymentCtrl.updatePaymentStatus);
router.get('/', auth, roleCheck('admin'), paymentCtrl.getAllPayments);

module.exports = router;
