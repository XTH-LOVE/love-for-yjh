const { Tunnel, bin, install } = require('cloudflared');
const fs = require('fs');

async function main() {
  console.log('Checking cloudflared binary...');
  
  // Install cloudflared binary if not present
  try {
    if (!fs.existsSync(bin)) {
      console.log('Installing cloudflared binary...');
      await install(bin);
      console.log('Binary installed at:', bin);
    } else {
      console.log('Binary found at:', bin);
    }
  } catch (e) {
    console.error('Failed to install binary:', e.message);
    // Try anyway
  }

  console.log('Starting Cloudflare Quick Tunnel...');
  const tunnel = Tunnel.quick({ port: 8080 });

  tunnel.once('url', (url) => {
    console.log('TUNNEL_READY:' + url);
    fs.writeFileSync('D:/love-for-yjh/tunnel-url.txt', url);
    console.log('Send this URL to your girlfriend!');
  });

  tunnel.once('connected', (conn) => {
    console.log('CONNECTED: location=' + conn.location + ' ip=' + conn.ip);
  });

  tunnel.on('error', (err) => {
    console.error('TUNNEL_ERR:' + err.message || err);
  });

  tunnel.on('exit', (code) => {
    console.log('TUNNEL_EXIT: code=' + code);
    process.exit(code || 0);
  });
}

main().catch(e => {
  console.error('FAIL:' + e.message);
  process.exit(1);
});
