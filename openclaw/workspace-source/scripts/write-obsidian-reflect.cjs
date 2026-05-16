/**
 * 写入 Obsidian 每日复盘
 */
const fs = require('fs');
const path = require('path');

const VAULT_PATH = 'D:\\日记仓库';
const DATE = '2026-04-12';
const FILE_PATH = path.join(VAULT_PATH, `${DATE}.md`);

function createDailyNote() {
  if (fs.existsSync(FILE_PATH)) {
    return { exists: true };
  }
  const template = `# ${DATE} 日记

## 今日目标


## 工作记录


## 学习收获


## 明日计划

`;
  fs.writeFileSync(FILE_PATH, template, 'utf8');
  return { success: true };
}

function appendToNote(content) {
  fs.appendFileSync(FILE_PATH, `\n${content}`, 'utf8');
  return { success: true };
}

// 复盘内容
const reflection = `## 🌙 承安晚间复盘

### 系统状态
- 正常运行任务数：14 / 总任务数 25
- 知识系统状态：正常运行，上次同步 2026-04-06（6天前），知识节点 2204 个

### 今日完成
- 执行 Palace 唤醒上下文生成（早 7:00 定时任务正常）
- 知识同步系统（knowledge-sync-node）每小时正常执行
- 足球数据更新任务（football_data_update）早 8:00 正常完成
- 足球预测系统 Phase 1 已完成，明日继续参数校准
- 晚报生成（evening_report_2030）正常推送至微信

### 问题追踪
- ⚠️ cheng_an_obsidian_daily_reflect 定时复盘任务超时：本次为第二次超时（lastError: timeout），需优化执行时间或延长超时限制
- ⚠️ morning_report_0800 连续失败 5 次：任务超时，已记录在 memory/2026-04-11.md，晚报已汇报
- ⚠️ weather_0830 天气推送超时 1 次：contextToken 获取问题待修复
- 🔴 cheng_an_self_check_1300 禁用中（MODULE_NOT_FOUND: store.runtime-BUH06cih.js，OpenClaw 更新导致哈希变化）

### 学习收获
- Palace 唤醒上下文生成有效减少 token 消耗（92% 节省），今日继续稳定运行
- 足球预测系统完成 Phase 1，模型框架已搭建

### 明日计划
1. 继续足球预测系统：测试 500.com 爬虫、校准泊松模型参数
2. 修复 morning_report_0800 连续超时问题（检查 generator.js 执行效率）
3. 评估 cheng_an_obsidian_daily_reflect 超时原因，优化或调整调度策略
`;

// 执行
console.log('=== 写入 Obsidian 每日复盘 ===');
console.log('日期:', DATE);
console.log('路径:', FILE_PATH);

const createResult = createDailyNote();
console.log('创建/检查笔记:', JSON.stringify(createResult));

appendToNote(reflection);
console.log('复盘内容已追加');

const finalContent = fs.readFileSync(FILE_PATH, 'utf8');
console.log('文件最终长度:', finalContent.length, '字符');
console.log('写入完成');
