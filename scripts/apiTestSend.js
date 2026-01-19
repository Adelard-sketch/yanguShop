const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://127.0.0.1:4000/api/twilio/send', {
      to: 'whatsapp:+233538453058',
      message: 'API test message (axios)'
    }, { timeout: 10000 });

    console.log('API send response:', res.status, res.data);
  } catch (err) {
    console.error('API send error:', err?.response?.status, err?.response?.data || err.message);
    process.exit(1);
  }
})();
