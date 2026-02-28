const path = require('path');
require(path.resolve(process.cwd(), './src/config/env'));
const { connect } = require('../src/config/database');
const { MONGO_URI } = require('../src/config/env');
const TwilioMessage = require('../src/models/TwilioMessage');

(async () => {
  try {
    await connect(MONGO_URI);
    const items = await TwilioMessage.find({}).sort({ createdAt: -1 }).limit(10).lean();
    console.log('Recent Twilio logs:');
    console.log(items.map(i => ({ sid: i.sid, from: i.from, to: i.to, body: i.body, status: i.status, createdAt: i.createdAt })));
    process.exit(0);
  } catch (e) {
    console.error('Error querying logs:', e.message || e);
    process.exit(2);
  }
})();
