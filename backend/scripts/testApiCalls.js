const axios = require('axios');

(async () => {
  try {
    const sendRes = await axios.post('http://localhost:4000/api/twilio/send', { to: 'whatsapp:+233538453058', message: 'API test message from node script' });
    console.log('Send response:', sendRes.data);
  } catch (e) {
    console.error('Send error:', e && e.response ? e.response.data : e.message || e);
  }

  try {
    const logs = await axios.get('http://localhost:4000/api/twilio/logs?limit=5');
    console.log('Logs:', JSON.stringify(logs.data, null, 2));
  } catch (e) {
    console.error('Logs error:', e && e.response ? e.response.data : e.message || e);
  }
})();
