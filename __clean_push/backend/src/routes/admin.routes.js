const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');
const agentCtrl = require('../controllers/agent.controller');
const promoCtrl = require('../controllers/promo.controller');

// Dashboard stats
router.get('/dashboard', auth, roleCheck('admin'), adminCtrl.dashboard);

// Admin: manage agents
router.post('/agents', auth, roleCheck('admin'), agentCtrl.createByAdmin);
router.get('/agents', auth, roleCheck('admin'), agentCtrl.list);

// Admin: promos
router.post('/promos', auth, roleCheck('admin'), promoCtrl.create);
router.get('/promos', auth, roleCheck('admin'), promoCtrl.list);

module.exports = router;
