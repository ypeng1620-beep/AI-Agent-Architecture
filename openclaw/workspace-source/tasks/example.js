/**
 * Cron 任务示例 - 展示如何使用任务管理系统
 * 
 * 原则：
 * 1. 一个 cron 只做一件事
 * 2. 复杂任务拆分成短任务
 * 3. 自动重试 + 退避
 * 4. 故障复盘 + 进化
 */

// 引入任务管理器
const { 
  splitTask, 
  getNextSubtask, 
  createRetryExecutor,
  getSuggestions 
} = require('./task-manager');

/**
 * 示例：复杂任务拆分成多个短任务
 */
async function runComplexTask() {
  const taskName = 'daily-report';
  
  // 拆分任务
  const taskId = splitTask(taskName, [
    'fetch-data',
    'process-data', 
    'generate-report',
    'send-notification'
  ]);
  
  const executor = createRetryExecutor();
  
  // 执行每个子任务
  while (true) {
    const subtask = getNextSubtask(taskId);
    if (!subtask) break;
    
    console.log(`▶ Executing: ${subtask.name}`);
    
    const result = await executor.execute(taskId, subtask.id, async (attempt) => {
      // 模拟任务执行
      if (subtask.name === 'fetch-data') {
        await fetchData();
      } else if (subtask.name === 'process-data') {
        await processData();
      } else if (subtask.name === 'generate-report') {
        await generateReport();
      } else if (subtask.name === 'send-notification') {
        await sendNotification();
      }
      
      return { done: true };
    });
    
    if (!result.success) {
      console.error(`✗ Subtask failed: ${subtask.name}`, result.error);
      // 可以选择继续或终止
    }
  }
  
  console.log('✅ Task completed');
}

/**
 * 示例：简单任务（推荐方式）
 */
async function runSimpleTask() {
  const taskName = 'health-check';
  const taskId = splitTask(taskName, ['check-gateway']);
  
  const executor = createRetryExecutor();
  
  const result = await executor.execute(taskId, `${taskName}-0`, async () => {
    // 执行健康检查
    await checkGatewayHealth();
    return { status: 'ok' };
  });
  
  if (result.success) {
    console.log('✅ Health check passed');
  } else {
    console.error('✗ Health check failed');
  }
}

// 模拟函数
async function fetchData() {
  // 实际实现...
  await new Promise(r => setTimeout(r, 100));
}

async function processData() {
  await new Promise(r => setTimeout(r, 100));
}

async function generateReport() {
  await new Promise(r => setTimeout(r, 100));
}

async function sendNotification() {
  await new Promise(r => setTimeout(r, 100));
}

async function checkGatewayHealth() {
  // 实际实现...
  await new Promise(r => setTimeout(r, 100));
}

// 导出
module.exports = {
  runComplexTask,
  runSimpleTask,
  getSuggestions
};
