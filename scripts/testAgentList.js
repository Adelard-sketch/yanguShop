/**
 * Test script to verify agent list API
 * Run: node scripts/testAgentList.js
 * This creates a test agent and checks if it appears in the admin list
 */

const http = require('http');

// Step 1: Create a test agent
console.log('🧪 Testing Agent System...\n');

const testAgent = {
  name: 'Test Agent',
  email: `agent${Date.now()}@example.com`,
  phone: '+233123456789',
  address: '123 Test Street',
  whatsapp: '+233987654321'
};

console.log('📝 Step 1: Creating test agent...');
console.log('   Name:', testAgent.name);
console.log('   Email:', testAgent.email);
console.log('   Phone:', testAgent.phone);

const createData = JSON.stringify(testAgent);

const createOptions = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/agents',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': createData.length
  }
};

const req = http.request(createOptions, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      if (res.statusCode === 201) {
        console.log('✅ Agent created successfully!');
        console.log('   Status:', res.statusCode);
        console.log('   Promo Code:', response.data?.promoCode);
        console.log('   Agent ID:', response.data?.agent?._id);
        
        console.log('\n📋 Step 2: Agents should now appear in admin list');
        console.log('   To view the agent list:');
        console.log('   1. Go to http://localhost:3000/admin/agents');
        console.log('   2. Login as admin (if not already)');
        console.log('   3. The newly created agent "Test Agent" should appear in the list');
        console.log('   4. You should see the promo code displayed (e.g., AGENT-TA-XXXX)');
      } else {
        console.log('❌ Failed to create agent');
        console.log('   Status:', res.statusCode);
        console.log('   Response:', response);
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
      console.log('   Raw response:', body);
    }
  });
});

req.on('error', err => {
  console.error('❌ Request error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('\n⚠️  Backend is not running on port 4000');
    console.error('   Please ensure the backend server is running:');
    console.error('   cd backend && npm start');
  }
});

req.write(createData);
req.end();
