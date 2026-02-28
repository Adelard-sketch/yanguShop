const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const { MONGO_URI } = require('../src/config/env');
const User = require('../src/models/User');

async function run() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL || 'adelborauzima@gmail.com';
  const phone = process.argv[3] || process.env.ADMIN_PHONE || '+233538453058';

  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const user = await User.findOne({ email });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }

  user.phone = phone.replace(/[^0-9+]/g, '');
  await user.save();
  console.log('Updated user phone for', email, '->', user.phone);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
