const axios = require('axios');
const mongoose = require('mongoose');
const { MONGO_URI } = require('../src/config/env');

// Credentials for an existing admin. Prefer environment variables, fallback to seed values.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'adelborauzima@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AdelMirab1$';

async function getLoginCodeFromDb(email) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const User = require('../src/models/User');
  const user = await User.findOne({ email }).lean();
  await mongoose.disconnect();
  if (!user) throw new Error('User not found in DB');
  if (!user.loginCode) throw new Error('No login code found for user; ensure /api/auth/login was called');
  return user.loginCode;
}

(async () => {
  try {
    // Step 1: call login endpoint to trigger sending a login code
    console.log('Calling /api/auth/login for', ADMIN_EMAIL);
    const loginRes = await axios.post('http://127.0.0.1:4000/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, { timeout: 10000 });
    console.log('Login response:', loginRes.data);

    // Step 2: read the login code from DB (simulates receiving the email/whatsapp code)
    const code = await getLoginCodeFromDb(ADMIN_EMAIL);
    console.log('Retrieved login code from DB (for test):', code);

    // Step 3: verify login to receive a JWT token
    const verifyRes = await axios.post('http://127.0.0.1:4000/api/auth/login/verify', { email: ADMIN_EMAIL, code }, { timeout: 10000 });
    const token = verifyRes.data?.token;
    if (!token) throw new Error('Login verification did not return a token');

    // Step 4: call the protected logs endpoint
    const res = await axios.get('http://127.0.0.1:4000/api/twilio/logs?limit=3', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    console.log('Logs response status:', res.status);
    console.log('Body:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error fetching logs:', err?.response?.status, err?.response?.data || err.message);
    process.exit(1);
  }
})();
