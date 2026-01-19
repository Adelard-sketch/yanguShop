const express = require('express');
const router = express.Router();
const twilioCtrl = require('../controllers/twilio.controller');
const auth = require('../middlewares/auth.middleware');
const roleCheck = require('../middlewares/role.middleware');

// API endpoint to send WhatsApp via Twilio
router.post('/send', twilioCtrl.send);

// Twilio webhook for incoming messages
router.post('/webhook', twilioCtrl.receive);

// Admin: list message logs (protected)
router.get('/logs', auth, roleCheck('admin'), twilioCtrl.logs);

module.exports = router;
