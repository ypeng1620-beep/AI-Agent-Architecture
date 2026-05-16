/**
 * 创建股票监控Cron任务
 */
const http = require('http');

const GATEWAY_URL = '127.0.0.1';
const GATEWAY_PORT = 18789;
const TOKEN = 'cce6b01d3b1f722bc3f1736be9672e161738c69b5028bee3';

function apiRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: GATEWAY_URL,
      port: GATEWAY_PORT,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function createStockWatcherCron() {
  // Cron任务定义：每隔5分钟检查股票价格
  const cronJob = {
    id: 'stock_price_watcher',
    name: '股票价格监控',
    schedule: '*/5 9:30-15:00 * * 1-5',  // 交易时间内每5分钟
    script: 'C:\\Users\\ypeng\\.openclaw\\workspace\\tasks\\stock-watcher-check.cjs',
    enabled: true,
    delivery: {
      mode: 'announce',
      channel: 'openclaw-weixin'
    }
  };

  try {
    console.log('正在创建股票监控cron任务...');
    
    // 尝试创建任务
    const result = await apiRequest('POST', '/api/cron/jobs', cronJob);
    console.log('创建结果:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (e) {
    console.error('API请求失败:', e.message);
    
    // 尝试列出当前任务
    try {
      console.log('\n尝试列出当前cron任务...');
      const list = await apiRequest('GET', '/api/cron/jobs');
      console.log('当前任务:', JSON.stringify(list, null, 2));
    } catch (e2) {
      console.error('列出任务也失败:', e2.message);
    }
    
    return null;
  }
}

createStockWatcherCron();
