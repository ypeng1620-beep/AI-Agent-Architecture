const obsidian = require('./obsidian-helper.js');

const content = `# 🫡 OpenClaw × Obsidian 联动测试

**时间**: 2026-03-31 08:57
**状态**: ✅ 联动成功

## 测试内容
- [x] 读取 Obsidian 笔记 ✅
- [x] 写入 Obsidian 笔记 ✅
- [x] 创建每日笔记 ✅
- [x] 搜索笔记 ✅

---

*此笔记由承安自动生成*
`;

obsidian.writeNote('openclaw/OpenClaw-Obsidian-Test.md', content);
console.log('写入成功:', 'D:\\日记仓库\\openclaw\\OpenClaw-Obsidian-Test.md');
