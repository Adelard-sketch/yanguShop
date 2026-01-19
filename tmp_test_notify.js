const http = require('http');
const payload = JSON.stringify({ toPhone: '+256777969984', message: 'Test order notification from YanguShop' });
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/orders/test-notify-public',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log('BODY', data);
  });
});

req.on('error', (e) => {
  console.error('Request error', e);
});

req.write(payload);
req.end();
