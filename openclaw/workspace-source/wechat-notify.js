const { sendWechatMsg } = require('./tools/wechat-push');
sendWechatMsg('老爷，早！📰 日报已生成\n📁 文件位置：daily-paper/output/2026-04-01.html').then(r => console.log(r)).catch(e => console.error(e));
