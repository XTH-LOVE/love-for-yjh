const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: '127.0.0.1', port: 8080, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:8080${path}`, (res) => {
      let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('--- Register ---');
  let r = await post('/api/auth/register', {username:'yjh',password:'love520',email:'yjh@love.com'});
  console.log(r.status, r.body);

  console.log('--- Login ---');
  r = await post('/api/auth/login', {username:'yjh',password:'love520'});
  console.log(r.status, r.body);

  console.log('--- Random Note ---');
  r = await get('/api/love/random-note');
  console.log(r.status, r.body);
}
main().catch(e => console.error('ERR:', e.message));
