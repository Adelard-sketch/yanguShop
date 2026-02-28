const express = require('express');
const router = express.Router();
const visitCtrl = require('../controllers/visit.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');

// Public: record a visit
router.post('/', visitCtrl.create);

// Admin: list recent visits
router.get('/', auth, roleCheck('admin'), visitCtrl.list);

module.exports = router;
