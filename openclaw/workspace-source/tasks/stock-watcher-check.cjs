/**
 * 股票价格检查脚本
 * 检查：601868.sh (目标3.00元), 003035.sz (目标7.50元)
 * 价格到了则发送微信通知
 */

const https = require('https');

const STOCKS = [
  { code: '601868', market: 1, name: '601868', target: 3.00 },
  { code: '003035', market: 0, name: '003035', target: 7.50 },
];

function getStockPrice(code, market) {
  return new Promise((resolve, reject) => {
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${market}.${code}&fields=f43,f57,f58`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const price = json.data.f43 / 100;
          const name = json.data.f58;
          resolve({ price, name });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  const results = [];
  
  for (const stock of STOCKS) {
    try {
      const info = await getStockPrice(stock.code, stock.market);
      const reached = info.price >= stock.target;
      results.push({
        code: stock.code,
        name: info.name,
        price: info.price,
        target: stock.target,
        reached,
        diff: stock.target - info.price
      });
      console.log(`${info.name}: ${info.price.toFixed(2)}元 (目标${stock.target}元) ${reached ? '✅ 到目标!' : '还差' + (stock.target - info.price).toFixed(2) + '元'}`);
    } catch (e) {
      console.error(`获取${stock.code}失败:`, e.message);
    }
  }
  
  // 返回是否需要提醒
  const targetsReached = results.filter(r => r.reached);
  if (targetsReached.length > 0) {
    const msg = targetsReached.map(r => `${r.name} ${r.price.toFixed(2)}元 ✅`).join('\n');
    console.log('\n🚨 达到目标价!');
    console.log(msg);
    return { shouldNotify: true, reached: targetsReached };
  }
  
  return { shouldNotify: false, reached: [] };
}

main().then(r => {
  process.exit(r.shouldNotify ? 0 : 1);
}).catch(e => {
  console.error(e);
  process.exit(2);
});
