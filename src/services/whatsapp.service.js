const axios = require('axios');
const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_VERSION } = require('../config/env');

function normalizeNumber(n) {
  if (!n) return n;
  // remove spaces and plus and non-digits
  return n.toString().replace(/[^0-9]/g, '');
}

exports.send = async (to, message) => {
  if (WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
    try {
      const apiVersion = WHATSAPP_API_VERSION || 'v17.0';
      const url = `https://graph.facebook.com/${apiVersion}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const toNum = normalizeNumber(to);
      const payload = {
        messaging_product: 'whatsapp',
        to: toNum,
        type: 'text',
        text: { body: message },
      };

      const res = await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
      });

      return { to, message, id: res.data?.messages?.[0]?.id || null, status: res.status };
    } catch (err) {
      console.error('WhatsApp Cloud API send failed:', err?.response?.data || err.message || err);
      throw err;
    }
  }

  console.warn('WhatsApp Cloud API not configured; skipping send to', to);
  return { to, message, status: 'skipped' };
};
