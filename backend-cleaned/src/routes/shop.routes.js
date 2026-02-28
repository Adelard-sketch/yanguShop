const express = require('express');
const router = express.Router();
const shopCtrl = require('../controllers/shop.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', auth, shopCtrl.create);
router.get('/', shopCtrl.list);

module.exports = router;
