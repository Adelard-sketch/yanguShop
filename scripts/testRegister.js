const http = require('http');

const data = JSON.stringify({
  name: 'Auto Test',
  email: 'autotest@example.com',
  password: 'Password123',
  phone: '+233240000001'
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('statusCode', res.statusCode);
    console.log('body:', body);
  });
});

req.on('error', err => { console.error('Request error', err); });
req.write(data);
req.end();
