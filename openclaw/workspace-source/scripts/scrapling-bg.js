/**
 * Scrapling 后台爬虫服务
 * 自动定时执行爬取任务
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  tasks: [
    {
      name: 'stock-news',
      interval: 30 * 60 * 1000, // 30分钟
      script: `
from scrapling import Fetcher
f = Fetcher()
r = f.get('https://finance.sina.com.cn/stock/')
print('Stock news:', r.status)
`
    },
    {
      name: 'weibo-trend',
      interval: 60 * 60 * 1000, // 60分钟
      script: `
from scrapling import Fetcher
f = Fetcher()
r = f.get('https://m.weibo.cn')
print('Weibo:', r.status)
`
    }
  ],
  logFile: 'logs/scrapling.log',
  pidFile: 'logs/scrapling.pid'
};

// 确保日志目录
const logDir = path.dirname(CONFIG.logFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志函数
function log(msg) {
  const time = new Date().toISOString();
  const logMsg = `[${time}] ${msg}\n`;
  fs.appendFileSync(CONFIG.logFile, logMsg);
  console.log(logMsg.trim());
}

// 运行Python脚本
function runScript(script) {
  return new Promise((resolve, reject) => {
    const proc = spawn('python', ['-c', script], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    proc.stdout.on('data', (data) => { output += data.toString(); });
    proc.stderr.on('data', (data) => { output += data.toString(); });
    
    proc.on('close', (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output));
    });
    
    proc.on('error', reject);
  });
}

// 任务调度器
class TaskScheduler {
  constructor() {
    this.running = new Map();
    this.intervals = [];
  }
  
  start() {
    log('Starting Scrapling background service...');
    
    CONFIG.tasks.forEach(task => {
      const interval = setInterval(async () => {
        if (this.running.get(task.name)) {
          log(`Task ${task.name} still running, skip this round`);
          return;
        }
        
        log(`Running task: ${task.name}`);
        this.running.set(task.name, true);
        
        try {
          const result = await runScript(task.script);
          log(`Task ${task.name} completed: ${result.trim()}`);
        } catch (e) {
          log(`Task ${task.name} failed: ${e.message}`);
        } finally {
          this.running.set(task.name, false);
        }
      }, task.interval);
      
      this.intervals.push(interval);
      log(`Scheduled ${task.name} every ${task.interval / 60000}min`);
    });
    
    // 保存PID
    fs.writeFileSync(CONFIG.pidFile, process.pid.toString());
    log('Service started successfully');
  }
  
  stop() {
    log('Stopping Scrapling background service...');
    this.intervals.forEach(clearInterval);
    if (fs.existsSync(CONFIG.pidFile)) {
      fs.unlinkSync(CONFIG.pidFile);
    }
    log('Service stopped');
  }
}

// 启动
if (require.main === module) {
  const scheduler = new TaskScheduler();
  scheduler.start();
  
  process.on('SIGINT', () => {
    scheduler.stop();
    process.exit();
  });
  
  process.on('SIGTERM', () => {
    scheduler.stop();
    process.exit();
  });
}

module.exports = { TaskScheduler };