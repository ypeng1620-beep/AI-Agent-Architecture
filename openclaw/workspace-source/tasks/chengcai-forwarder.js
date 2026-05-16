/**
 * 承财报告自动转发系统
 * 
 * 监听承财的任务完成报告，自动整理转发给老爷
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(process.cwd(), 'tasks', 'chengcai-reports.json');

/**
 * 加载已处理的报告记录
 */
function loadProcessedReports() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { processed: [], lastCheck: null };
}

/**
 * 保存已处理的报告
 */
function saveProcessedReports(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * 获取所有子 agent 会话
 */
async function getChengCaiSessions() {
  // 这里通过 sessions_list 获取承财相关的会话
  // 由于无法直接获取，返回一个占位符
  // 实际使用时需要调用 OpenClaw API
  return [];
}

/**
 * 检查并转发承财报告
 */
async function checkAndForwardReports() {
  const state = loadProcessedReports();
  state.lastCheck = Date.now();
  
  // 这里可以添加实际的检查逻辑
  // 例如：检查 cron 任务的执行结果
  
  // 目前的 cron 任务已经设置了 delivery: announce
  // 所以承财的报告应该已经自动发送到飞书
  
  saveProcessedReports(state);
  
  return {
    checked: true,
    newReports: 0,
    lastCheck: state.lastCheck,
  };
}

/**
 * 手动转发报告（用于测试或手动触发）
 */
function manualForward(reportContent, reportType) {
  const state = loadProcessedReports();
  
  const report = {
    id: `report-${Date.now()}`,
    type: reportType,
    content: reportContent,
    timestamp: Date.now(),
    forwarded: false,
  };
  
  state.processed.push(report);
  
  // 只保留最近 50 条
  if (state.processed.length > 50) {
    state.processed = state.processed.slice(-50);
  }
  
  saveProcessedReports(state);
  
  return report;
}

/**
 * 获取待转发报告
 */
function getPendingReports() {
  const state = loadProcessedReports();
  return state.processed.filter(r => !r.forwarded);
}

/**
 * 标记报告已转发
 */
function markForwarded(reportId) {
  const state = loadProcessedReports();
  const report = state.processed.find(r => r.id === reportId);
  if (report) {
    report.forwarded = true;
    report.forwardedAt = Date.now();
    saveProcessedReports(state);
  }
  return report;
}

module.exports = {
  checkAndForwardReports,
  manualForward,
  getPendingReports,
  markForwarded,
  loadProcessedReports,
};
