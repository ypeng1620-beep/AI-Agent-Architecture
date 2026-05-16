const QRCode = require('C:/Users/ypeng/AppData/Roaming/npm/node_modules/qrcode');

const url = process.argv[2] || 'https://github.com/ypeng1620';
const outputPath = process.argv[3] || 'C:/Users/ypeng/.openclaw/workspace/tasks/qr.png';

QRCode.toFile(outputPath, url, { type: 'png' }, (err) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  console.log('QR saved to:', outputPath);
});
