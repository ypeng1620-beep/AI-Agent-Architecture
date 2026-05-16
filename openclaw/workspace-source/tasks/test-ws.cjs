/**
 * 通过WebSocket连接Gateway测试
 */
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// 尝试找到ws模块
let ws;
try {
  ws = require('ws');
} catch (e) {
  console.log('ws模块不可用，尝试安装...');
  // 尝试使用node内置的websocket功能
  console.log('需要ws模块来连接Gateway WebSocket API');
  process.exit(1);
}

const GATEWAY_URL = 'ws://127.0.0.1:18789';
const TOKEN = 'cce6b01d3b1f722bc3f1736be9672e161738c69b5028bee3';

const ws = new WebSocket(GATEWAY_URL, {
  headers: {
    'Authorization': `Bearer ${TOKEN}`
  }
});

ws.on('open', () => {
  console.log('WebSocket已连接');
  
  // 发送一个cron.list请求
  const request = {
    method: 'cron.list',
    params: {},
    id: 1
  };
  ws.send(JSON.stringify(request));
});

ws.on('message', (data) => {
  console.log('收到消息:', data.toString());
  ws.close();
});

ws.on('error', (e) => {
  console.error('WebSocket错误:', e.message);
});

ws.on('close', () => {
  console.log('连接关闭');
  process.exit(0);
});

setTimeout(() => {
  console.log('超时，关闭连接');
  ws.close();
  process.exit(1);
}, 5000);
