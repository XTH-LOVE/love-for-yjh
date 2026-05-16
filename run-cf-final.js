// Use the cloudflared npm package's own install function + spawn tunnel
const path = require('path');
const fs = require('fs');
const { spawn, execSync } = require('child_process');

// The cloudflared npm package location
const CF_PKG = 'C:/Users/26780/AppData/Roaming/npm/node_modules/cloudflared';
const BIN_PATH = path.join(CF_PKG, 'bin', 'cloudflared.exe');

async function main() {
  // Check if binary already exists and works
  let binPath = BIN_PATH;
  
  if (fs.existsSync(binPath)) {
    console.log('Binary exists at: ' + binPath + ' (' + fs.statSync(binPath).size + ' bytes)');
  } else {
    // Use npm package to install
    console.log('Installing cloudflared binary via npm package...');
    try {
      const { install } = require(CF_PKG + '/lib/install.js');
      binPath = await install(BIN_PATH);
      console.log('Installed to: ' + binPath);
    } catch (e) {
      console.error('Install failed:', e.message);
      console.log('Trying manual download...');
      
      // Manual download with redirect support
      const url = 'https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';
      const http = require('https');
      await new Promise((resolve, reject) => {
        console.log('Downloading from GitHub (may be slow)...');
        const file = fs.createWriteStream(BIN_PATH);
        http.get(url, (res) => {
          if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
            http.get(res.headers.location, (r2) => r2.pipe(file)).on('error', reject);
            return;
          }
          res.pipe(file);
        }).on('error', reject);
        file.on('finish', () => { file.close(); resolve(); });
      });
      console.log('Download complete');
    }
  }

  console.log('Binary: ' + binPath + ' (' + fs.statSync(binPath).size + ' bytes)');

  // Start tunnel
  console.log('Starting Cloudflare Quick Tunnel on port 8080...');
  const tunnel = spawn(binPath, ['tunnel', '--url', 'http://localhost:8080'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  tunnel.stdout.on('data', (data) => {
    const text = data.toString();
    console.log('CF: ' + text.trim());
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      fs.writeFileSync('D:/love-for-yjh/tunnel-url.txt', match[0]);
      console.log('');
      console.log('========================================');
      console.log('  TUNNEL READY: ' + match[0]);
      console.log('  Send this URL to your girlfriend!');
      console.log('========================================');
    }
  });

  tunnel.stderr.on('data', (data) => {
    const text = data.toString();
    console.log('CF: ' + text.trim());
    const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
    if (match) {
      fs.writeFileSync('D:/love-for-yjh/tunnel-url.txt', match[0]);
      console.log('');
      console.log('========================================');
      console.log('  TUNNEL READY: ' + match[0]);
      console.log('  Send this URL to your girlfriend!');
      console.log('========================================');
    }
  });

  tunnel.on('close', (code) => {
    console.log('Tunnel exited with code ' + code);
    process.exit(code || 0);
  });
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
