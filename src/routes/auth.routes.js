const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.post('/login/verify', authCtrl.verifyLogin);
router.post('/verify', authCtrl.verify);
router.post('/resend', authCtrl.resend);
router.post('/forgot', authCtrl.forgot);
router.post('/reset', authCtrl.reset);

module.exports = router;
