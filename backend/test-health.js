const http = require('http');

const req = http.request({
  hostname: '127.0.0.1',
  port: 8080,
  path: '/api/health',
  method: 'GET',
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Health:', res.statusCode, body));
});
req.on('error', (e) => console.error('ERROR:', e.message));
req.end();
