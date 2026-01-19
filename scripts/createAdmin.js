const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const User = require('../src/models/User');
const { MONGO_URI } = require('../src/config/env');

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = 'adelborauzima@gmail.com';
  const password = 'AdelMirab1$';
  const name = 'Adel Borauzima';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin user already exists:', existing.email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({ name, email, password: hashed, role: 'admin' });
  console.log('Admin user created:', user.email);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});