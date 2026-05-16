/**
 * 每日复盘写入 Obsidian
 * 定时任务调用此脚本，将当日复盘写入 Obsidian 每日笔记
 */

const obsidian = require('./obsidian-helper.js');

// 获取日期
const today = new Date();
const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

// 当日复盘内容（由主Agent在调用时生成）
const args = process.argv.slice(2);
let reflectContent = args.join(' ');

if (!reflectContent || reflectContent.trim() === '') {
  // 如果没有传入内容，使用默认模板
  reflectContent = `## 今日复盘

### 系统状态
- Gateway: 正常运行
- 定时任务: 正常执行

### 完成工作


### 学习收获


### 问题与改进


### 明日计划

`;
}

// 追加到每日笔记
const filePath = `D:\\日记仓库\\openclaw\\${dateStr}.md`;

// 检查文件是否存在
const fs = require('fs');
if (!fs.existsSync(filePath)) {
  // 创建每日笔记模板
  obsidian.createDailyNote(today);
}

// 追加复盘内容
fs.appendFileSync(filePath, `\n\n---\n\n## 🌙 承安晚间复盘\n${reflectContent}`, 'utf8');

console.log('复盘已写入:', filePath);
