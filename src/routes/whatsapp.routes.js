const express = require('express');
const router = express.Router();
const whatsappCtrl = require('../controllers/whatsapp.controller');

// Facebook/Meta webhook verification
router.get('/webhook', whatsappCtrl.verify);
// Incoming messages
router.post('/webhook', whatsappCtrl.receive);

module.exports = router;
