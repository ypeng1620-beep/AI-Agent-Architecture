const { spawn } = require('node:child_process');
const path = require('node:path');

// Start the weixin login process
const openclawPath = 'C:/Users/ypeng/AppData/Roaming/npm/node_modules/openclaw/dist/openclaw.js';
const args = ['channels', 'login', '--channel', 'openclaw-weixin'];

console.log('Starting WeChat login...');

const proc = spawn('node', [openclawPath, ...args], {
  stdio: ['pipe', 'pipe', 'pipe'],
  windowsHide: true
});

let stdout = '';
let stderr = '';

proc.stdout.on('data', (data) => {
  const text = data.toString();
  stdout += text;
  process.stdout.write(text);
});

proc.stderr.on('data', (data) => {
  const text = data.toString();
  stderr += text;
  process.stderr.write(text);
});

proc.on('close', (code) => {
  console.log('Process exited with code:', code);
  // Look for QR code URL in output
  const match = stderr.match(/qrcode_img_content[=:]\s*['"]([^'"]+)['"]/);
  if (match) {
    console.log('Found QR URL:', match[1]);
  }
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('Timeout, killing process...');
  proc.kill();
  // Try to extract QR URL from output
  const qrMatch = stdout.match(/(https?:\/\/[^\s'"]+)/);
  if (qrMatch) {
    console.log('Extracted URL:', qrMatch[1]);
  }
  process.exit(0);
}, 30000);
