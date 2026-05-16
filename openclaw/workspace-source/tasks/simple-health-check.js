/**
 * 轻量级健康检查 - 一次性巡检脚本
 * 不依赖定时器，由外部cron调用
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function check(name, fn) {
  try {
    const result = fn();
    return { name, ...result };
  } catch (e) {
    return { name, status: 'error', message: e.message };
  }
}

const results = {
  timestamp: new Date().toISOString(),
  checks: [
    // Gateway健康检查
    check('gateway', () => {
      const healthFile = 'C:\\Users\\ypeng\\.openclaw\\logs\\config-health.json';
      if (!fs.existsSync(healthFile)) return { status: 'unknown', message: 'No health file' };
      const data = JSON.parse(fs.readFileSync(healthFile, 'utf8'));
      const key = Object.keys(data.entries || {})[0];
      const entry = data.entries?.[key];
      if (!entry?.lastKnownGood) return { status: 'unknown' };
      const age = Date.now() - new Date(entry.lastKnownGood.observedAt).getTime();
      const ageMin = (age / 60000).toFixed(0);
      return age > 600000 
        ? { status: 'warning', message: `Last ${ageMin}m ago` }
        : { status: 'ok', message: `OK (${ageMin}m ago)` };
    }),
    
    // 知识系统
    check('knowledge', () => {
      const idx = path.join(__dirname, '..', 'knowledge', 'prepared-index.json');
      if (!fs.existsSync(idx)) return { status: 'error', message: 'Index missing' };
      const data = JSON.parse(fs.readFileSync(idx, 'utf8'));
      const age = Date.now() - data.version;
      const ageH = (age / 3600000).toFixed(1);
      return { status: age > 7200000 ? 'warning' : 'ok', message: `${data.documents?.length || 0} docs, ${ageH}h old` };
    }),
    
    // 微信队列
    check('wechat', () => {
      const q = path.join(__dirname, 'wechat-queue-state.json');
      if (!fs.existsSync(q)) return { status: 'ok', message: 'No queue' };
      const data = JSON.parse(fs.readFileSync(q, 'utf8'));
      if (data.queue?.length > 0) return { status: 'warning', message: `${data.queue.length} pending` };
      return { status: 'ok', message: 'Queue empty' };
    }),
    
    // Ticket系统
    check('tickets', () => {
      const t = path.join(__dirname, 'task-tickets-v2.json');
      if (!fs.existsSync(t)) return { status: 'ok', message: 'No tickets' };
      const data = JSON.parse(fs.readFileSync(t, 'utf8'));
      return { status: 'ok', message: `${data.tickets?.length || 0} tickets` };
    }),
  ],
};

// 输出
const errors = results.checks.filter(c => c.status === 'error');
const warnings = results.checks.filter(c => c.status === 'warning');

if (errors.length > 0) {
  console.log(`❌ ${errors.length} errors:`);
  errors.forEach(p => console.log(`  - ${p.name}: ${p.message}`));
  process.exit(1);
} else if (warnings.length > 0) {
  console.log(`⚠️ ${warnings.length} warnings:`);
  warnings.forEach(p => console.log(`  - ${p.name}: ${p.message}`));
  console.log('✅ Other checks passed');
} else {
  console.log('✅ All checks passed');
}

console.log('---');
results.checks.forEach(c => console.log(`${c.status === 'error' ? '❌' : c.status === 'warning' ? '⚠️' : '✅'} ${c.name}: ${c.message}`));
