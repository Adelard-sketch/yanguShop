const axios = require('axios');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = require('../config/env');
const TwilioMessage = require('../models/TwilioMessage');

function normalizeNumber(n) {
  if (!n) return n;
  return n.toString().replace(/[^0-9+]/g, '');
}

exports.send = async (to, message) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.warn('Twilio credentials not configured; skipping Twilio send');
    return { to, message, status: 'skipped' };
  }

  const toNum = normalizeNumber(to).replace(/^\+?/, '');
  const from = TWILIO_WHATSAPP_FROM; // should be like whatsapp:+14155238886

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const params = new URLSearchParams();
  params.append('From', from);
  params.append('To', `whatsapp:${toNum}`);
  params.append('Body', message);

  try {
    const res = await axios.post(url, params.toString(), {
      auth: { username: TWILIO_ACCOUNT_SID, password: TWILIO_AUTH_TOKEN },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    // persist log
    try {
      await TwilioMessage.create({
        sid: res.data.sid,
        from,
        to: `whatsapp:${toNum}`,
        body: message,
        status: res.data.status || res.status,
        direction: 'outbound',
        raw: res.data,
      });
    } catch (e) {
      console.warn('Failed to persist Twilio message log', e?.message || e);
    }

    return { to, message, sid: res.data.sid, status: res.status };
  } catch (err) {
    console.error('Twilio send failed:', err?.response?.data || err.message || err);
    // try to persist failure
    try {
      await TwilioMessage.create({
        sid: err?.response?.data?.sid || null,
        from,
        to: `whatsapp:${toNum}`,
        body: message,
        status: err?.response?.status || 'error',
        direction: 'outbound',
        errorCode: err?.response?.data?.code || null,
        raw: err?.response?.data || { message: err.message },
      });
    } catch (e) {
      console.warn('Failed to persist Twilio error log', e?.message || e);
    }
    throw err;
  }
};
