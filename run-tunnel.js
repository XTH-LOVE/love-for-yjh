const lt = require('C:/Users/26780/AppData/Roaming/npm/node_modules/localtunnel');
const fs = require('fs');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function main() {
  try {
    const tunnel = await lt(8080);
    const url = tunnel.url;
    fs.writeFileSync('D:/love-for-yjh/tunnel-url.txt', url);
    console.log('TUNNEL_READY:' + url);
    console.log('Send this URL to your girlfriend!');
    tunnel.on('error', e => console.log('ERR:' + e.message));
    tunnel.on('close', () => { console.log('TUNNEL_CLOSED'); process.exit(0); });
  } catch(e) {
    console.log('FAIL:' + e.message);
  }
}
main();
