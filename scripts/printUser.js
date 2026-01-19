const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });
const User = require('../src/models/User');
const { MONGO_URI } = require('../src/config/env');

(async function(){
  try{
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const u = await User.findOne({ email: 'testcustomer@example.com' }).lean();
    console.log(u);
    process.exit(0);
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();
