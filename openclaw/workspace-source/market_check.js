const akshare = require('akshare');

async function main() {
  const time = new Date();
  const hour = time.getHours();
  const minute = time.getMinutes();
  const now = hour * 60 + minute;
  const morningStart = 9 * 60 + 30;
  const morningEnd = 11 * 60 + 30;
  const afternoonStart = 13 * 60;
  const afternoonEnd = 15 * 60;

  let status = '未开盘';
  if (now >= morningStart && now < morningEnd) status = '早盘';
  else if (now >= afternoonStart && now < afternoonEnd) status = '午盘';
  console.log('=== 开盘状态 ===');
  console.log('当前状态:', status);

  console.log('\n=== 大盘行情 ===');
  try {
    const index = await akshare.stock_zh_a_spot_em();
    const sh = index.find(i => i['代码'] === '000001');
    const sz = index.find(i => i['代码'] === '399001');
    if (sh) console.log('上证: ' + sh['最新价'] + ' (' + sh['涨跌幅'] + '%)');
    if (sz) console.log('深证: ' + sz['最新价'] + ' (' + sz['涨跌幅'] + '%)');
  } catch(e) { console.log('获取失败'); }

  console.log('\n=== 热点板块 ===');
  try {
    const board = await akshare.stock_board_industry_name_em();
    console.log(board.slice(0, 5).map(b => b['板块名称'] + ': ' + b['涨跌幅']).join('\n'));
  } catch(e) { console.log('获取失败'); }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });