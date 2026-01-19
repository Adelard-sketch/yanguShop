const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

module.exports = {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/yanguShop',
  JWT_SECRET: process.env.JWT_SECRET || 'changeme',
  JWT_EXP: process.env.JWT_EXP || '7d',
  MAIL_HOST: process.env.MAIL_HOST || '',
  MAIL_PORT: process.env.MAIL_PORT || '',
  MAIL_USER: process.env.MAIL_USER || '',
  MAIL_PASS: process.env.MAIL_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.MAIL_USER || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_WHATSAPP_FROM: process.env.TWILIO_WHATSAPP_FROM || '',
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v17.0',
};
