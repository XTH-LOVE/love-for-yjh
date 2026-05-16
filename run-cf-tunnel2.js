const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

const url = 'https://ghfast.top/https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe';
const outPath = 'D:\\cf-tunnel2.exe';

console.log('Downloading cloudflared...');

const file = fs.createWriteStream(outPath);
https.get(url, (res) => {
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    https.get(res.headers.location, (r2) => r2.pipe(file)).on('error', e => console.error('Redirect fail:', e.message));
    return;
  }
  res.pipe(file);
}).on('error', e => console.error('Download fail:', e.message));

file.on('finish', () => {
  file.close();
  console.log('Download complete: ' + fs.statSync(outPath).size + ' bytes');

  // Test binary
  const test = spawn(outPath, ['--version'], { stdio: 'inherit' });
  test.on('close', (code) => {
    console.log('Version test exited with code ' + code);

    // Start tunnel
    console.log('Starting Cloudflare Quick Tunnel on port 8080...');
    const tunnel = spawn(outPath, ['tunnel', '--url', 'http://localhost:8080'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    tunnel.stdout.on('data', (data) => {
      const text = data.toString();
      console.log('CF: ' + text);
      // Extract URL
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        const tunnelUrl = match[0];
        fs.writeFileSync('D:\\love-for-yjh\\tunnel-url.txt', tunnelUrl);
        console.log('TUNNEL_READY:' + tunnelUrl);
        console.log('Send this URL to your girlfriend!');
      }
    });

    tunnel.stderr.on('data', (data) => {
      const text = data.toString();
      console.log('CF-ERR: ' + text);
      // Also check stderr for URL
      const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        const tunnelUrl = match[0];
        fs.writeFileSync('D:\\love-for-yjh\\tunnel-url.txt', tunnelUrl);
        console.log('TUNNEL_READY:' + tunnelUrl);
      }
    });

    tunnel.on('close', (code) => {
      console.log('Tunnel exited with code ' + code);
    });
  });
});
