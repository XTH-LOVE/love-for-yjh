/**
 * Love For YJH — 自动隧道管理脚本
 *
 * PM2 管理此进程，PM2 负责崩溃重启。
 * 此脚本只负责：启动 cloudflared、抓取 URL、保存到桌面。
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const CLOUDFLARED = 'D:\\cloudflared-new.exe';
const DESKTOP = path.join(process.env.USERPROFILE || 'C:\\Users\\26780', 'Desktop');
const URL_FILE = path.join(DESKTOP, 'love-for-yjh-url.txt');
const LOG_FILE = path.join(__dirname, 'tunnel-url.log');

let tunnelProcess = null;
let resolvedUrl = null;
let isShuttingDown = false;

function log(msg) {
  const ts = new Date().toLocaleString('zh-CN');
  const line = `[${ts}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

function saveUrl(url) {
  if (!url) return;
  resolvedUrl = url;

  const content = `Love For YJH\n${url}\n\n账号: yjh\n密码: love520\n\n更新时间: ${new Date().toLocaleString('zh-CN')}\n`;
  fs.writeFileSync(URL_FILE, content, 'utf-8');
  fs.writeFileSync(path.join(__dirname, 'current-tunnel-url.txt'), url, 'utf-8');
  log(`URL saved: ${url}`);
}

function startTunnel() {
  if (isShuttingDown) return;
  log('Starting Cloudflare tunnel...');

  tunnelProcess = spawn(CLOUDFLARED, ['tunnel', '--url', 'http://localhost:8080'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  tunnelProcess.stdout.on('data', (data) => {
    const output = data.toString();
    const urlMatch = output.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i);
    if (urlMatch && urlMatch[0] !== resolvedUrl) {
      saveUrl(urlMatch[0]);
      setTimeout(() => verifyUrl(urlMatch[0]), 5000);
    }
  });

  tunnelProcess.stderr.on('data', (data) => {
    const output = data.toString();
    const urlMatch = output.match(/https:\/\/[a-z0-9\-]+\.trycloudflare\.com/i);
    if (urlMatch && urlMatch[0] !== resolvedUrl) {
      saveUrl(urlMatch[0]);
      setTimeout(() => verifyUrl(urlMatch[0]), 5000);
    }
    // Only log real errors
    if (output.includes('ERR ') || output.includes('error:')) {
      log(`[cloudflared] ${output.trim()}`);
    }
  });

  tunnelProcess.on('close', (code) => {
    log(`Tunnel exited with code: ${code}`);
    // Let PM2 handle restart, do NOT restart inside the script
  });

  tunnelProcess.on('error', (err) => {
    log(`Tunnel error: ${err.message}`);
  });
}

function verifyUrl(url) {
  try {
    const req = http.get(url, (res) => {
      log(`Verified! HTTP ${res.statusCode}`);
    });
    req.on('error', () => {});
    req.setTimeout(8000, () => { req.destroy(); });
  } catch (e) {}
}

function shutdown() {
  isShuttingDown = true;
  log('Shutting down...');
  if (tunnelProcess) {
    try { tunnelProcess.kill(); } catch (e) {}
  }
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

log('=== Tunnel Manager Started ===');
startTunnel();
