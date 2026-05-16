/**
 * 测试Gateway API端点
 */
const http = require('http');

const GATEWAY_URL = '127.0.0.1';
const GATEWAY_PORT = 18789;
const TOKEN = 'cce6b01d3b1f722bc3f1736be9672e161738c69b5028bee3';

function apiRequest(method, path) {
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

    console.log(`Testing: ${method} ${path}`);
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`);
        console.log(`  Response: ${data.substring(0, 200)}`);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (e) => {
      console.log(`  Error: ${e.message}`);
      reject(e);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoints() {
  const endpoints = [
    '/',
    '/health',
    '/api',
    '/api/v1',
    '/v1',
    '/v1/cron',
    '/v1/cron/jobs',
    '/rpc',
    '/ws',
    '/cron',
    '/cron/jobs'
  ];

  for (const ep of endpoints) {
    try {
      await apiRequest('GET', ep);
    } catch (e) {
      console.log(`  Failed: ${e.message}`);
    }
    console.log('');
  }
}

testEndpoints();
