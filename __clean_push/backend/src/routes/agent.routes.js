const express = require('express');
const router = express.Router();
const agentCtrl = require('../controllers/agent.controller');
const promoCtrl = require('../controllers/promo.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');

// Public: Onboard new agent
router.post('/', agentCtrl.create);

// Admin only routes
router.get('/', auth, roleCheck('admin'), agentCtrl.list);
router.get('/:id', auth, roleCheck('admin'), agentCtrl.get);
router.post('/:id/approve', auth, roleCheck('admin'), agentCtrl.approve);
router.post('/:id/reject', auth, roleCheck('admin'), agentCtrl.reject);
router.put('/:id', auth, roleCheck('admin'), agentCtrl.update);
router.post('/:id/deactivate', auth, roleCheck('admin'), agentCtrl.deactivate);

// Assign promo to agent (admin)
router.post('/:id/promos/:promoId/assign', auth, roleCheck('admin'), promoCtrl.assignToAgent);
// Promo endpoints (admin)
router.post('/promos', auth, roleCheck('admin'), promoCtrl.create);
router.get('/promos', auth, roleCheck('admin'), promoCtrl.list);

// Agent: Get their profile
router.get('/:id/profile', auth, agentCtrl.getProfile);

module.exports = router;
