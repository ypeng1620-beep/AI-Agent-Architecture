const https = require('https');
const fs = require('fs');
const path = require('path');
const QRCode = require('C:/Users/ypeng/AppData/Roaming/npm/node_modules/qrcode');

function fetchQRCode() {
  return new Promise((resolve, reject) => {
    const url = 'https://ilinkai.weixin.qq.com/ilink/bot/get_bot_qrcode?bot_type=3';
    console.log('Fetching QR code from WeChat...');
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    const qrResponse = await fetchQRCode();
    console.log('QR Response:', JSON.stringify(qrResponse, null, 2));
    
    if (qrResponse.qrcode_img_content) {
      const outputPath = 'C:/Users/ypeng/.openclaw/workspace/tasks/weixin-qr-login.png';
      await QRCode.toFile(outputPath, qrResponse.qrcode_img_content, { type: 'png' });
      console.log('✅ QR码已保存到:', outputPath);
      console.log('请用微信扫描此二维码登录');
    } else {
      console.error('❌ 未获取到QR码:', qrResponse);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main().then(() => {
  setTimeout(() => process.exit(0), 3000);
}).catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
