# Hermes Memory System → 承安/承财 蒸馏方案

## 一、Hermes Memory 核心机制分析

### 1.1 记忆区块结构

```
══════════════════════════════════════════════
MEMORY (your personal notes) [99% — 2,197/2,200 chars]
══════════════════════════════════════════════
[记忆内容：用户环境/偏好/项目状态/踩坑记录]
§
[第二块记忆]
§
[第三块记忆...]
══════════════════════════════════════════════
USER PROFILE (who the user is) [4% — 61/1,375 chars]
══════════════════════════════════════════════
[用户身份+核心偏好]
```

**关键发现：**
- 硬性上限 2,200 字符，超出自动截断（99% = 危险水位）
- 使用 `§` 作为记忆块分隔符
- 双重结构：MEMORY（事实记忆）+ USER PROFILE（用户画像）
- 系统 prompt 内嵌，无需额外 API 调用

### 1.2 记忆写入原则

| 应该记 | 不该记 |
|--------|--------|
| 用户偏好（语言/批准习惯） | 任务进度 |
| 环境细节（WSL/GitHub Token） | Session 结果 |
| 工具怪癖（网络/配置） | 临时 TODO |
| 稳定约定 | 已完成的日志 |
| 重复纠正（不再让用户重复） | 过程性信息 |

### 1.3 记忆触发时机

```python
# Hermes 记忆写入触发器
触发场景:
1. 完成复杂任务（5+ tool calls）后 → 保存为 skill
2. 修复错误后发现非平凡解法 → 保存为 skill
3. 发现工具新用法 → 保存为 skill
4. 用户纠正重复出现 → 写入 MEMORY
5. 用户引用过去对话 → session_search 召回
```

### 1.4 技能自动更新机制

```python
# Hermes skill 维护策略
使用 skill 时:
  → 发现 skill 过时/不完整/错误
  → 立即用 skill_manage(action='patch') 更新
  → 不等用户来问

技能是负债（liabilities）：
  → 不维护的技能会成为负担
  → 每次使用即维护时机
```

---

## 二、蒸馏目标（OpenClaw 适配）

### 2.1 当前 OpenClaw Memory 现状

- 知识库系统：86 文件 / 2291 节点（sync-simple.js 每 30 分钟）
- MEMORY.md：长期记忆文件
- memory/YYYY-MM-DD.md：每日会话日志

**差距分析：**
| 维度 | Hermes | OpenClaw | 蒸馏需求 |
|------|--------|----------|---------|
| 记忆格式 | 分块 + 字符限制 | 纯文本 | 设计分块格式 |
| 记忆注入 | 每轮自动 | 需手动读取 | system prompt 注入 |
| 技能维护 | 自动 patch | 无 | 实现 skill_manage |
| 召回机制 | session_search | 手动 memory_search | 自动化 |

---

## 三、蒸馏实现方案

### Phase 1：设计记忆区块格式（今日完成）

**文件路径：** `memory/user-profile.md`（新增）

```markdown
══════════════════════════════════════════════
承安 MEMORY BLOCK v1.0
══════════════════════════════════════════════

## 用户核心偏好
- 称呼：老爷 / 承安
- 语言：全程中文
- 命令批准：简洁确认，不废话
- 反馈风格：核心结论 + 必要细节，不冗余

## 用户环境
- OS: Windows + WSL
- OpenClaw: 本地 Gateway (ws://127.0.0.1:18789)
- 主要渠道：飞书 Webhook + WebChat

## 工具环境
- Node.js: v24.14.0
- Python: 3.14.3
- GitHub Token: ghp_xxxxxxxxxxxxxxxxxxxx

## 项目状态
- 足球预测系统: D:\football-prediction, API :8001
- AI-Agent-Guard: D:\ai-agent-guard (v2.7)
- OpenClaw Enhancement Suite: D:\OpenClaw-Enhancement-Suite (v0.1.0)

## 用户方法论
- "不做创新，做分流"：观察差评→微型替代→购买欲望评估→价格低落地快→做预售

══════════════════════════════════════════════
承财 MEMORY BLOCK v1.0
══════════════════════════════════════════════

## 承财职责
- 股票/量化/选股相关任务
- Cron: 09:00 开盘前 / 10:00 监控 / 14:15+14:50 选股 / 15:30 收盘 / 18:00 进化 / 20:00 夜学

## 选股参数
- 低价格选股策略：价格敏感型
- [待校准]

══════════════════════════════════════════════
```

### Phase 2：实现记忆自动注入（约2小时）

**方案：** 在 AGENTS.md 的 Session Startup 流程中强化记忆注入

```markdown
## Session Startup（修订）

1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `memory/user-profile.md` — 蒸馏自 Hermes 的用户记忆区块 ← 新增
4. Read `memory/YYYY-MM-DD.md` (today + yesterday) for recent context
5. **Palace Wake-Up Context**（优先）...
```

### Phase 3：实现技能自动维护机制（约3小时）

**新增 skill 维护规则（写入 AGENTS.md）：**

```markdown
## 技能维护规则（蒸馏自 Hermes）

### 触发时机
- 使用某 skill 完成任务后 → 自动评估是否需要更新
- 使用某 skill 时发现错误/过时 → 立即 patch
- 完成复杂任务（5+ tool calls）→ 主动提出保存为 skill

### 维护操作
```
发现 skill 问题 → 用 edit 工具直接更新
              → 不等用户来问
              → 不拖延
```

### 记忆写入优先级
1. 用户纠正过的偏好（避免重复纠正）→ 最高
2. 环境配置和工具怪癖 → 高
3. 项目关键状态 → 中
4. 临时任务进度 → 不记录
```

---

## 四、承财记忆系统专项设计

### 4.1 承财 Memory Block（每日更新）

```markdown
## 承财 Daily Memory（每日 cron 自动更新）

### 今日选股结果
- [date]: 选出 N 股 / 涨跌幅 / 命中率

### 进化记录
- [date]: 模型校准 / 策略调整 / 错误回顾

### 踩坑笔记
- [date]: 某 API 不可用 / 某策略失效
```

### 4.2 承财进化 Cron 增强

从 Hermes 蒸馏的进化模式：

```javascript
// 承财进化 cron 增强设计
hermes_evolve_1800 增强版:

1. 读取今日选股记录
2. 比对实际涨跌
3. 发现策略问题 → 写入 memory/承财踩坑.md
4. 发现新规律 → 建议更新选股策略
5. 记忆区块超 2000 字符 → 触发压缩
```

---

## 五、实施计划

| 阶段 | 内容 | 预计时间 | 产出物 |
|------|------|---------|--------|
| Phase 1 | 设计 user-profile.md 格式 | 30 分钟 | `memory/user-profile.md` |
| Phase 2 | 修订 AGENTS.md 记忆注入流程 | 1 小时 | `AGENTS.md`（修订版） |
| Phase 3 | 设计承财 Daily Memory 格式 | 1 小时 | `memory/chengcai-daily.md` |
| Phase 4 | 增强承财进化 cron | 2 小时 | `cron` 任务更新 |

---

## 六、验证方式

```bash
# 1. 检查记忆区块格式
cat memory/user-profile.md | wc -c  # 应 < 2200

# 2. 检查每轮注入
# → 新 session 中应自动看到用户偏好

# 3. 检查技能维护
# → 使用 skill 发现问题后，查看 skill 是否被 patch
```

---

## 七、风险与限制

- OpenClaw 无原生 `skill_manage` 工具 → 用 `edit` 替代
- 记忆字符上限更宽松（文件 vs prompt）→ 可存储更多
- 承财/承安记忆需隔离 → 分别文件存储

---

*蒸馏自 Hermes Agent session log 2026-04-19 | 分析时间: 2026-04-21*
