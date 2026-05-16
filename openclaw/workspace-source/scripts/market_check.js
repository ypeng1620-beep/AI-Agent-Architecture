const akshare = require('akshare');

async function main() {
  // 沪深300
  try {
    const res = await akshare.stock_zh_index_spot();
    const hs300 = res.find(r => r['指数代码'] === '000300');
    console.log('沪深300:', JSON.stringify(hs300, null, 2));
  } catch(e) { console.log('沪深300 Error:', e.message); }
  
  // 上证
  try {
    const sz = res.find(r => r['指数代码'] === '000001');
    console.log('上证指数:', JSON.stringify(sz, null, 2));
  } catch(e) { console.log('上证 Error:', e.message); }
  
  // 深证
  try {
    const sz399001 = res.find(r => r['指数代码'] === '399001');
    console.log('深证成指:', JSON.stringify(sz399001, null, 2));
  } catch(e) { console.log('深证 Error:', e.message); }
}
main().catch(console.error);