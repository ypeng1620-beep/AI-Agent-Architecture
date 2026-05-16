/**
 * 股票价格监控任务
 * 监控：601868.sh (目标3.00元), 003035.sz (目标7.50元)
 */
const https = require('https');

const STOCKS = [
  { code: '601868', market: 1, name: '601868.sh', target: 3.00 },
  { code: '003035', market: 0, name: '003035.sz', target: 7.50 },
];

async function getStockPrice(code, market) {
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

module.exports = { STOCKS, getStockPrice };
