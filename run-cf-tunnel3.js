// Download cloudflared via npm package with mirror
const path = require('path');
const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

const MIRROR = 'https://ghfast.top/https://github.com/cloudflare/cloudflared/releases/latest/download/';
const FILE = 'cloudflared-windows-amd64.exe';
const BIN_PATH = 'D:\\cf-tunnel3.exe';

function download(url, to) {
  return new Promise((resolve, reject) => {
    console.log('Downloading: ' + url);
    const file = fs.createWriteStream(to);
    https.get(url, (res) => {
      // Handle redirects
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        file.close();
        fs.unlinkSync(to);
        resolve(download(res.headers.location, to));
        return;
      }
      if (res.statusCode >= 200 && res.statusCode < 300) {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log('Saved: ' + fs.statSync(to).size + ' bytes');
            resolve(to);
          });
        });
      } else {
        file.close();
        fs.unlinkSync(to);
        reject(new Error('HTTP ' + res.statusCode));
      }
    }).on('error', (e) => {
      file.close();
      if (fs.existsSync(to)) fs.unlinkSync(to);
      reject(e);
    });
  });
}

async function main() {
  // Download
  try {
    await download(MIRROR + FILE, BIN_PATH);
  } catch (e) {
    // Try without mirror
    console.log('Mirror failed, trying direct...');
    try {
      await download('https://github.com/cloudflare/cloudflared/releases/latest/download/' + FILE, BIN_PATH);
    } catch (e2) {
      console.error('All downloads failed:', e2.message);
      process.exit(1);
    }
  }

  // Verify
  console.log('Binary size: ' + fs.statSync(BIN_PATH).size + ' bytes');

  // Start tunnel
  console.log('Starting Cloudflare Quick Tunnel on port 8080...');
  const tunnel = spawn(BIN_PATH, ['tunnel', '--url', 'http://localhost:8080'], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  tunnel.stdout.on('data', (data) => {
    const text = data.toString();
    output += text;
    console.log('CF: ' + text.trim());
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      fs.writeFileSync('D:\\love-for-yjh\\tunnel-url.txt', match[0]);
      console.log('');
      console.log('========================================');
      console.log('  TUNNEL READY: ' + match[0]);
      console.log('========================================');
    }
  });

  tunnel.stderr.on('data', (data) => {
    const text = data.toString();
    output += text;
    console.log('CF-ERR: ' + text.trim());
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      fs.writeFileSync('D:\\love-for-yjh\\tunnel-url.txt', match[0]);
      console.log('');
      console.log('========================================');
      console.log('  TUNNEL READY: ' + match[0]);
      console.log('========================================');
    }
  });

  tunnel.on('close', (code) => {
    console.log('Tunnel process exited with code ' + code);
    process.exit(code || 0);
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err.message);
    process.exit(1);
  });
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
