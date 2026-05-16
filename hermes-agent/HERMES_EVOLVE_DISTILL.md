# Hermes Self-Improvement → 承财进化系统 蒸馏方案

## 一、Hermes Self-Improvement 核心机制分析

### 1.1 三大核心模块

| 模块 | 文件 | 功能 |
|------|------|------|
| **Trajectory Compressor** | `trajectory_compressor.py` | 长对话压缩，保护首尾轮次 |
| **Session Store** | `hermes_state.py` | SQLite + FTS5 持久化会话 |
| **Toolset Manager** | `toolsets.py` | 工具分组与动态调度 |

### 1.2 Trajectory Compressor 压缩策略

```
保护策略：
1. 保护首轮（system prompt + 首次 human + 首次 assistant + 首次 tool）
2. 保护末轮（最后 N 轮对话）
3. 仅压缩中间轮次
4. 用 LLM 生成摘要替换压缩区间
5. 工具调用保持完整（模型可继续）
```

**关键参数：**
- `target_max_tokens`: 15,250
- `summary_target_tokens`: 750
- `protect_last_n_turns`: 4

### 1.3 会话存储设计（hermes_state.py）

```sql
-- 关键表结构
sessions: id, source, model, system_prompt, tool_call_count, 
          input_tokens, output_tokens, estimated_cost_usd, title

messages: session_id, role, content, tool_calls, timestamp

-- FTS5 全文搜索
messages_fts: content
```

### 1.4 进化循环流程

```
Hermes Self-Improvement Loop:
1. 每轮对话记录 tool_call_count + tokens
2. 定期检查会话成本
3. 触发压缩：当 token 超限时
4. 摘要生成：用 LLM 压缩中间轮次
5. 技能更新：使用后自动 patch
6. 每日复盘：cronjob 触发进化
```

---

## 二、蒸馏目标（承财适配）

### 2.1 承财进化需求分析

**当前承财 cron 时间表：**
- 18:00: 进化复盘（已有，未强化）
- 20:00: 夜间学习
- 21:00: 承财报告汇总

**差距：**
| 维度 | Hermes | 承财现状 | 蒸馏需求 |
|------|--------|---------|---------|
| 选股追踪 | 有轨迹压缩 | 手动记录 | 自动记录+分析 |
| 命中率复盘 | 有 cost/token 统计 | 无 | 每日统计 |
| 技能自优化 | 使用即 patch | 无 | 实现 patch 机制 |
| 记忆压缩 | 轨迹压缩 | 无 | 实现摘要压缩 |

---

## 三、Phase 2 实现方案

### 3.1 承财进化 cron 增强设计

**文件路径：** `tasks/chengcai-evolve-enhanced.js`（新建）

```javascript
/**
 * 承财进化增强版 v1.0
 * 蒸馏自 Hermes Self-Improvement Loop
 * 
 * 功能：
 * 1. 读取今日选股记录（从 chengcai-daily.md）
 * 2. 统计命中率（实际涨跌 vs 预测）
 * 3. 发现策略问题 → 写入踩坑记录
 * 4. 发现新规律 → 更新选股策略
 * 5. 记忆区块超 2200 字符 → 触发压缩摘要
 * 6. 输出进化报告 → 推送飞书
 */

const fs = require('fs');
const path = require('path');

const DAILY_MEMORY = 'C:/Users/ypeng/.openclaw/workspace/memory/chengcai-daily.md';
const USER_PROFILE = 'C:/Users/ypeng/.openclaw/workspace/memory/user-profile.md';
const EVOLVE_LOG = 'C:/Users/ypeng/.openclaw/workspace/memory/chengcai-evolve-log.md';

const MAX_MEMORY_CHARS = 2200;

async function evolve() {
  // 1. 读取今日选股记录
  const today = new Date().toISOString().split('T')[0];
  const dailyContent = fs.readFileSync(DAILY_MEMORY, 'utf-8');
  
  // 2. 解析选股结果
  const records = parseStockRecords(dailyContent, today);
  
  // 3. 生成进化报告
  const report = generateEvolveReport(records, today);
  
  // 4. 检查记忆区块大小
  const profileContent = fs.readFileSync(USER_PROFILE, 'utf-8');
  if (profileContent.length > MAX_MEMORY_CHARS) {
    const compressed = await compressMemory(profileContent);
    fs.writeFileSync(USER_PROFILE, compressed);
    report.memoryCompression = true;
  }
  
  // 5. 追加到进化日志
  appendToEvolveLog(report, today);
  
  // 6. 输出报告
  return formatReport(report);
}

function parseStockRecords(content, date) {
  // 解析格式：### YYYY-MM-DD ... [待校准]
  // TODO: 接入实际选股数据
  return { stocks: [], hits: 0, total: 0 };
}

async function compressMemory(content) {
  // TODO: 调用 LLM API 生成压缩摘要
  // 保留首尾块，中间压缩
  return content.substring(0, MAX_MEMORY_CHARS);
}

function generateEvolveReport(records, date) {
  return {
    date,
    totalPicks: records.total,
    hits: records.hits,
    hitRate: records.total > 0 ? (records.hits / records.total * 100).toFixed(1) + '%' : 'N/A',
    patternFound: [],
    pitfalls: [],
    strategyUpdates: [],
    memoryCompression: false
  };
}
```

### 3.2 选股记录数据结构

**文件路径：** `memory/chengcai-daily.md`（已创建，待强化格式）

```markdown
══════════════════════════════════════════════
承财选股记录 v2.0（Hermes Trajectory 格式）
══════════════════════════════════════════════

## 2026-04-21 选股记录

### 14:15 低价选股
| 股票 | 预测理由 | 实际涨跌 | 命中 |
|------|---------|---------|------|
| [股票A] | 低价+放量 | +3.2% | ✅ |
| [股票B] | 低价+突破 | -1.5% | ❌ |

**命中率**: 50% (1/2)
**轨迹摘要**: [由 trajectory_compressor 压缩]

### 14:50 尾盘选股
| 股票 | 预测理由 | 实际涨跌 | 命中 |
|------|---------|---------|------|
| [股票C] | 尾盘异动 | +5.1% | ✅ |

**命中率**: 100% (1/1)

══════════════════════════════════════════════
## 2026-04-21 进化记录
══════════════════════════════════════════════

### 策略更新
- [更新] 发现低价+放量策略命中率较高（>60%），提升权重
- [更新] 尾盘异动策略稳定性好，保持

### 踩坑记录
- [踩坑] 股票B：低价但无量，突破失败 → 记录"低价必须配合放量"

### 记忆区块
- [压缩] user-profile.md 超出 2200 字符，触发压缩摘要

══════════════════════════════════════════════
```

### 3.3 技能自动 Patch 机制

**新增文件：** `tasks/skill-auto-patch.js`

```javascript
/**
 * 技能自动 Patch 机制（蒸馏自 Hermes skill_manage）
 * 
 * 触发条件：
 * 1. 使用某 skill 完成任务后 → 评估是否需要 patch
 * 2. 使用某 skill 时发现错误/过时 → 立即 patch
 * 3. 完成复杂任务（5+ tool calls）→ 主动提出保存为 skill
 * 
 * 操作：
 * 发现 skill 问题 → 用 edit 工具直接更新
 */

const SKILLS_DIR = 'C:/Users/ypeng/.openclaw/workspace/.agents/skills/';

function checkAndPatchSkill(skillName, issue, fix) {
  // 读取 skill 文件
  const skillPath = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  
  // 用 edit 工具直接 patch
  // edit({ path: skillPath, oldText: issue, newText: fix });
  
  console.log(`[skill-auto-patch] ${skillName}: ${issue} → ${fix}`);
}
```

---

## 四、实施计划

| 阶段 | 内容 | 产出物 | 预计时间 |
|------|------|--------|---------|
| Phase 2.1 | 强化 chengcai-daily.md 格式 | 选股记录结构化 | 30 分钟 |
| Phase 2.2 | 实现进化 cron 增强脚本 | `tasks/chengcai-evolve-enhanced.js` | 2 小时 |
| Phase 2.3 | 实现技能自动 patch 机制 | `tasks/skill-auto-patch.js` | 1 小时 |
| Phase 2.4 | 每日自动记录触发点 | 集成到选股 cron | 30 分钟 |

---

## 五、验证方式

```bash
# 1. 检查进化日志
cat memory/chengcai-evolve-log.md

# 2. 检查命中率统计
# → 每日自动更新

# 3. 检查 skill patch 记录
# → 使用 skill 发现问题后查看是否被 patch
```

---

*蒸馏自 Hermes Agent Self-Improvement Loop | 分析时间: 2026-04-21*
