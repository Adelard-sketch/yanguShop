const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
require('../src/config/env');

const User = require('../src/models/User');

async function wait(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function run(){
  const base = process.env.BACKEND_URL || 'http://localhost:4000';
  const testEmail = process.env.TEST_EMAIL || `integration+${Date.now()}@example.com`;
  const password = 'TestPass1!';
  console.log('Using test email:', testEmail);

  try{
    // register
    console.log('Registering user...');
    const reg = await axios.post(`${base}/api/auth/register`, { email: testEmail, password, name: 'Integration Tester' });
    console.log('Register response:', reg.data);

    // wait a moment for DB write
    await wait(500);

    // connect to DB and fetch verification code
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await User.findOne({ email: testEmail });
    if(!user) throw new Error('User not found in DB after register');
    console.log('Found user in DB, verificationCode:', user.verificationCode ? '[present]' : '[missing]');

    if(!user.verificationCode) {
      console.warn('No verification code found; cannot complete verify step automatically. Check email manually.');
    } else {
      // verify
      console.log('Verifying email with code from DB...');
      const v = await axios.post(`${base}/api/auth/verify`, { email: testEmail, code: user.verificationCode });
      console.log('Verify response:', v.data);
    }

    // login -> retrieve login code from DB and verify
    console.log('Logging in to trigger login code...');
    await axios.post(`${base}/api/auth/login`, { email: testEmail, password });
    await wait(500);
    const userAfterLogin = await User.findOne({ email: testEmail });
    if(userAfterLogin && userAfterLogin.loginCode){
      console.log('Found loginCode in DB, verifying...');
      const lv = await axios.post(`${base}/api/auth/login/verify`, { email: testEmail, code: userAfterLogin.loginCode });
      console.log('Login verify response:', lv.data);
    } else {
      console.warn('No loginCode found in DB; manual verification may be necessary.');
    }

    // forgot password -> if plain token saved, reset
    console.log('Requesting password reset...');
    await axios.post(`${base}/api/auth/forgot`, { email: testEmail });
    await wait(500);
    const userForReset = await User.findOne({ email: testEmail });
    if(process.env.ALLOW_PLAIN_RESET_TOKEN === 'true' && userForReset && userForReset.passwordResetPlain){
      console.log('Found plain reset token in DB, performing reset...');
      const newPass = 'NewTestPass1!';
      const r = await axios.post(`${base}/api/auth/reset`, { email: testEmail, token: userForReset.passwordResetPlain, password: newPass });
      console.log('Password reset response:', r.data);
    } else {
      console.log('Plain reset token not available; skip automatic reset. Set ALLOW_PLAIN_RESET_TOKEN=true to enable this step.');
    }

    // cleanup: remove user
    await User.deleteOne({ email: testEmail });
    console.log('Cleanup done.');
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Integration test error:', err.response ? err.response.data : err.message);
    try{ await mongoose.disconnect(); }catch(e){}
    process.exit(1);
  }
}

run();
