/**
 * 任务管理系统
 * - 任务拆分
 * - 失败警告
 * - 重试退避
 * - 复盘进化
 */

const fs = require('fs');
const path = require('path');

const TASK_DIR = path.join(process.cwd(), 'tasks');
const STATE_FILE = path.join(TASK_DIR, 'state.json');
const LOG_FILE = path.join(TASK_DIR, 'failure-log.json');
const EVOLUTION_FILE = path.join(TASK_DIR, 'evolution.json');

// 确保目录存在
if (!fs.existsSync(TASK_DIR)) {
  fs.mkdirSync(TASK_DIR, { recursive: true });
}

// 默认配置
const DEFAULT_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,     // 基础延迟 1s
  maxDelayMs: 60000,     // 最大延迟 60s
  backoffMultiplier: 2,  // 退避倍数
  warningThreshold: 2,   // 警告阈值（失败次数）
};

/**
 * 加载任务状态
 */
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return {};
}

/**
 * 保存任务状态
 */
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * 加载故障日志
 */
function loadFailureLog() {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
  }
  return [];
}

/**
 * 保存故障日志
 */
function saveFailureLog(log) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2));
}

/**
 * 加载进化记录
 */
function loadEvolution() {
  if (fs.existsSync(EVOLUTION_FILE)) {
    return JSON.parse(fs.readFileSync(EVOLUTION_FILE, 'utf-8'));
  }
  return { fixes: [], patterns: [] };
}

/**
 * 保存进化记录
 */
function saveEvolution(evolution) {
  fs.writeFileSync(EVOLUTION_FILE, JSON.stringify(evolution, null, 2));
}

/**
 * 计算退避延迟
 */
function getBackoffDelay(attempt, config = DEFAULT_CONFIG) {
  const delay = Math.min(
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  // 添加随机抖动 (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

/**
 * 拆分复杂任务为短任务
 */
function splitTask(taskName, subtasks) {
  const state = loadState();
  const taskId = `${taskName}-${Date.now()}`;
  
  state[taskId] = {
    name: taskName,
    subtasks: subtasks.map((st, i) => ({
      id: `${taskId}-${i}`,
      name: st,
      status: 'pending',
      attempts: 0,
      lastAttempt: null,
      error: null,
    })),
    currentIndex: 0,
    createdAt: Date.now(),
    status: 'running',
  };
  
  saveState(state);
  return taskId;
}

/**
 * 获取下一个待执行子任务
 */
function getNextSubtask(taskId) {
  const state = loadState();
  const task = state[taskId];
  if (!task) return null;
  
  while (task.currentIndex < task.subtasks.length) {
    const subtask = task.subtasks[task.currentIndex];
    if (subtask.status === 'pending' || subtask.status === 'failed') {
      return subtask;
    }
    task.currentIndex++;
  }
  
  return null;
}

/**
 * 标记子任务状态
 */
function updateSubtaskStatus(taskId, subtaskId, status, error = null) {
  const state = loadState();
  const task = state[taskId];
  if (!task) return;
  
  const subtask = task.subtasks.find(st => st.id === subtaskId);
  if (!subtask) return;
  
  subtask.status = status;
  subtask.lastAttempt = Date.now();
  if (error) {
    subtask.error = error;
    subtask.attempts++;
  }
  
  // 检查是否全部完成
  const allDone = task.subtasks.every(st => st.status === 'completed' || st.status === 'skipped');
  if (allDone) {
    task.status = 'completed';
  }
  
  saveState(state);
  return subtask;
}

/**
 * 发送警告
 */
function sendWarning(taskId, subtaskId, error, config = DEFAULT_CONFIG) {
  const state = loadState();
  const task = state[taskId];
  const subtask = task?.subtasks.find(st => st.id === subtaskId);
  
  const warning = {
    time: new Date().toISOString(),
    taskId,
    taskName: task?.name,
    subtaskId,
    subtaskName: subtask?.name,
    error: error.message || String(error),
    attempts: subtask?.attempts || 0,
    config: config,
  };
  
  console.error(`⚠️ [WARNING] Task failed: ${task?.name} > ${subtask?.name}`);
  console.error(`   Error: ${warning.error}`);
  console.error(`   Attempts: ${warning.attempts}/${config.maxRetries}`);
  
  return warning;
}

/**
 * 记录故障并复盘
 */
function recordFailure(taskId, subtaskId, error, context = {}) {
  const failureLog = loadFailureLog();
  
  const failure = {
    id: `failure-${Date.now()}`,
    timestamp: new Date().toISOString(),
    taskId,
    subtaskId,
    error: error.message || String(error),
    context,
    resolution: null,
    fixApplied: null,
  };
  
  failureLog.push(failure);
  
  // 只保留最近 100 条
  if (failureLog.length > 100) {
    failureLog.splice(0, failureLog.length - 100);
  }
  
  saveFailureLog(failureLog);
  
  // 触发复盘
  const fix = analyzeAndFix(failure);
  
  return { failure, fix };
}

/**
 * 复盘分析并尝试修复
 * 原则：先定位，后修复；尽量机制化
 */
function analyzeAndFix(failure) {
  const evolution = loadEvolution();
  const errorMsg = failure.error.toLowerCase();
  
  // ========== 第一步：定位（Root Cause Analysis）==========
  // 常见的错误模式 → 定位问题类型
  const patterns = [
    { pattern: /timeout/i, category: 'timeout', rootCause: '请求超时或服务响应慢' },
    { pattern: /permission denied|eperm/i, category: 'permission', rootCause: '权限不足或文件被占用' },
    { pattern: /not found|enoent/i, category: 'not_found', rootCause: '资源不存在或路径错误' },
    { pattern: /network|ECONNREFUSED|econnreset/i, category: 'network', rootCause: '网络不可达或服务未启动' },
    { pattern: /syntax|parse|json/i, category: 'syntax', rootCause: '语法错误或数据格式问题' },
    { pattern: /rate limit|429/i, category: 'rate_limit', rootCause: '请求频率超限' },
    { pattern: /memory|heap|out of memory/i, category: 'memory', rootCause: '内存不足或资源耗尽' },
    { pattern: /disk|space|enoent.*disk/i, category: 'disk', rootCause: '磁盘空间不足' },
  ];
  
  let matchedPattern = null;
  let rootCause = '未知原因';
  let category = 'unknown';
  
  for (const p of patterns) {
    if (p.pattern.test(errorMsg)) {
      matchedPattern = p;
      category = p.category;
      rootCause = p.rootCause;
      break;
    }
  }
  
  // 额外诊断：尝试获取更多上下文信息
  const diagnosis = {
    errorMessage: failure.error,
    category,
    rootCause,
    timestamp: failure.timestamp,
    context: failure.context || {},
  };
  
  // ========== 第二步：修复（Fix Strategy）==========
  // 根据定位结果，给出机制化的修复建议
  const fixStrategies = {
    timeout: {
      fix: '增加超时时间、检查网络延迟、添加重试机制',
      autoAction: '可自动增加超时配置',
    },
    permission: {
      fix: '检查文件权限、确认目标文件未被占用、以管理员运行',
      autoAction: '可自动修复常见权限问题',
    },
    not_found: {
      fix: '检查文件路径、确认资源存在性、使用环境变量',
      autoAction: '可自动创建缺失目录',
    },
    network: {
      fix: '检查服务状态、确认网络可达性、验证防火墙规则',
      autoAction: '可自动触发服务重启',
    },
    syntax: {
      fix: '检查代码语法、验证数据格式、查看日志详情',
      autoAction: '需要手动修复',
    },
    rate_limit: {
      fix: '降低请求频率、使用缓存、排队机制',
      autoAction: '可自动添加延迟',
    },
    memory: {
      fix: '增加内存限制、优化数据结构、清理缓存',
      autoAction: '可自动触发GC或重启服务',
    },
    disk: {
      fix: '清理磁盘空间、删除临时文件、扩展存储',
      autoAction: '可自动清理临时文件',
    },
  };
  
  const strategy = fixStrategies[category] || { 
    fix: '需要人工分析', 
    autoAction: '无法自动修复' 
  };
  
  // 记录修复（先定位 → 后修复）
  const fix = {
    failureId: failure.id,
    timestamp: new Date().toISOString(),
    
    // 第一步：定位
    diagnosis: {
      category,
      rootCause,
      errorMessage: failure.error,
    },
    
    // 第二步：修复策略
    fix: {
      suggestion: strategy.fix,
      autoAction: strategy.autoAction,
      canAutoFix: strategy.autoAction.includes('可自动'),
    },
    
    // 机制化标记
    mechanism: {
      isMechanism: matchedPattern !== null,
      patternMatched: category !== 'unknown',
    }
  };
  
  evolution.fixes.push(fix);
  
  // 更新模式统计
  if (matchedPattern) {
    const patternKey = matchedPattern.pattern.toString();
    const existing = evolution.patterns.find(p => p.pattern === patternKey);
    if (existing) {
      existing.count++;
      existing.lastSeen = new Date().toISOString();
      existing.rootCause = rootCause;
      existing.autoFix = strategy.autoAction;
    } else {
      evolution.patterns.push({
        pattern: patternKey,
        category,
        rootCause,
        fix: strategy.fix,
        autoAction: strategy.autoAction,
        count: 1,
        firstSeen: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      });
    }
  }
  
  saveEvolution(evolution);
  
  return fix;
}

/**
 * 获取执行建议（先定位 → 后修复）
 */
function getSuggestions() {
  const evolution = loadEvolution();
  const failureLog = loadFailureLog();
  
  // 统计最近失败
  const recentFailures = failureLog.filter(f => {
    const age = Date.now() - new Date(f.timestamp).getTime();
    return age < 24 * 60 * 60 * 1000; // 24小时内
  });
  
  const suggestions = {
    recentFailureCount: recentFailures.length,
    
    // 定位：TOP 错误模式
    topPatterns: evolution.patterns
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(p => ({
        category: p.category || 'unknown',
        pattern: p.pattern,
        count: p.count,
        rootCause: p.rootCause || '未知',
      })),
    
    // 修复：对应的自动修复能力
    fixStrategies: evolution.patterns
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(p => ({
        pattern: p.pattern,
        fix: p.fix || '需要人工分析',
        autoAction: p.autoAction || '无法自动修复',
        canAutoFix: (p.autoAction || '').includes('可自动'),
      })),
    
    recentFixes: evolution.fixes.slice(-5).reverse().map(f => ({
      timestamp: f.timestamp,
      diagnosis: f.diagnosis,
      fix: f.fix,
    })),
    
    // 机制化统计
    mechanismStats: {
      totalPatterns: evolution.patterns.length,
      autoFixable: evolution.patterns.filter(p => (p.autoAction || '').includes('可自动')).length,
      needManual: evolution.patterns.filter(p => (p.autoAction || '').includes('需要')).length,
    }
  };
  
  return suggestions;
}

/**
 * 创建带重试的任务执行器
 */
function createRetryExecutor(config = DEFAULT_CONFIG) {
  return {
    config,
    
    async execute(taskId, subtaskId, fn) {
      let attempt = 0;
      let lastError = null;
      
      while (attempt < config.maxRetries) {
        try {
          const result = await fn(attempt);
          updateSubtaskStatus(taskId, subtaskId, 'completed');
          return { success: true, result, attempts: attempt + 1 };
        } catch (error) {
          lastError = error;
          attempt++;
          
          if (attempt < config.maxRetries) {
            const delay = getBackoffDelay(attempt, config);
            console.log(`   ⏳ Retrying in ${delay}ms... (attempt ${attempt + 1}/${config.maxRetries})`);
            await new Promise(r => setTimeout(r, delay));
          }
        }
      }
      
      // 全部失败
      updateSubtaskStatus(taskId, subtaskId, 'failed', lastError);
      sendWarning(taskId, subtaskId, lastError, config);
      recordFailure(taskId, subtaskId, lastError);
      
      return { success: false, error: lastError, attempts: attempt };
    }
  };
}

module.exports = {
  DEFAULT_CONFIG,
  splitTask,
  getNextSubtask,
  updateSubtaskStatus,
  sendWarning,
  recordFailure,
  analyzeAndFix,
  getSuggestions,
  getBackoffDelay,
  createRetryExecutor,
  loadState,
  loadFailureLog,
  loadEvolution,
};
