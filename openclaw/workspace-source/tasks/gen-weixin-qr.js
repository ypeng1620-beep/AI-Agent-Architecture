const { writeFileSync } = require('node:fs');
const path = require('node:path');
const QRCode = require('C:/Users/ypeng/AppData/Roaming/npm/node_modules/openclaw/node_modules/@tencent-weixin/openclaw-weixin/node_modules/qrcode');

// Test with a known URL first
const testUrl = 'https://github.com/ypeng1620';
const outputPath = 'C:/Users/ypeng/.openclaw/workspace/tasks/weixin-qr-test.png';

QRCode.toFile(outputPath, testUrl, { type: 'png' }, (err) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('QR saved to:', outputPath);
  }
});
