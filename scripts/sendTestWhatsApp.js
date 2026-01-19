/*
 Simple test script to send a WhatsApp message via Twilio using env config.
 Usage:
  node scripts/sendTestWhatsApp.js <to-number>
 or set TEST_WHATSAPP_TO in your backend/.env and run without args.
*/

const path = require('path');
// ensure env is loaded same as app
require(path.resolve(process.cwd(), './src/config/env'));
const twilioService = require('../src/services/twilio.service');
// connect DB so persistence in twilio.service works
const { connect } = require('../src/config/database');
const { MONGO_URI } = require('../src/config/env');

const args = process.argv.slice(2);
let to = args[0] || process.env.TEST_WHATSAPP_TO;
if (!to) {
  console.error('Target number not provided. Usage: node scripts/sendTestWhatsApp.js whatsapp:+233XXXXXXXXX');
  process.exit(1);
}

const message = args[1] || 'Hello from YanguShop (test message)';

(async () => {
  // ensure DB connection for logging
  try {
    await connect(MONGO_URI);
  } catch (e) {
    console.warn('DB connect failed, continuing without persistence:', e?.message || e);
  }
  try {
    const res = await twilioService.send(to, message);
    console.log('Send result:', res);
  } catch (err) {
    console.error('Error sending test WhatsApp message:', err?.response?.data || err.message || err);
    process.exit(2);
  }
})();
