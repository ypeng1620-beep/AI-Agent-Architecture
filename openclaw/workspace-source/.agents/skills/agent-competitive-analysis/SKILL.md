---
name: agent-competitive-analysis
description: CLI AI Agent 竞争分析 — 对比 Claude Code、OpenClaw、Hermes 的设计优劣。用于：(1) 了解竞品强项来启发 Hermes 改进，(2) 在设计新功能前参考竞品实现，(3) 选择合适的 Agent 完成特定任务。触发条件：讨论 Agent 选型、功能设计参考、竞品调研、"XX 功能 Hermes 怎么做"。
---

# CLI Agent 竞争分析

## 三系统定位

| 系统 | 语言 | 定位 | 核心优势 |
|------|------|------|----------|
| **Claude Code** | TypeScript | Anthropic 官方 CLI | 命令系统、UI（React+Ink）、工具丰富度 |
| **OpenClaw** | Node.js | 多渠道消息网关 | 跨平台消息、Plugin SDK、生态丰富 |
| **Hermes** | Python | 你的个人 Agent | 多渠道、Skill 系统、cron 调度 |

---

## Claude Code 强项（值得借鉴）

### 1. 命令系统（最值得学）

Claude Code 有 **101 个命令**，全部放在 `src/commands/` 目录，每个命令是独立文件。设计亮点：

- **命令即插拔**：`commands/btw/index.ts` 只负责"侧聊"，职责单一
- **slash command**：用户输入 `/compact` 触发上下文压缩
- **命令参数解析**：使用 commander.js 或自定义解析
- **bundled skills as commands**：17 个内置 skill 通过命令暴露

**借鉴**：Hermes 的 slash command 系统类似，但可以学 Claude Code 的：
- 每个命令独立文件
- 命令描述写清楚触发条件
- 命令可以调用其他命令（composable）

### 2. 工具系统（Feature Flag 条件加载）

```typescript
const SleepTool = feature('PROACTIVE') || feature('KAIROS')
  ? require('./tools/SleepTool/SleepTool.js').SleepTool
  : null
```

**借鉴**：Hermes 也用条件加载，但 Claude Code 的 feature flag 更细粒度。可以学的是：
- 按环境/用户类型条件加载工具
- 工具可以标记为"实验性"
- 工具 schema 动态生成

### 3. Task 子系统（5个工具）

Claude Code 有完整的任务系统：
- `TaskCreateTool` — 创建任务
- `TaskListTool` — 列出任务
- `TaskGetTool` — 获取任务详情
- `TaskUpdateTool` — 更新状态
- `TaskOutputTool` — 获取输出
- `TaskStopTool` — 停止任务

**借鉴**：Hermes 的 todo 工具有类似能力，但 Claude Code 的 task 更强大（支持输出、停止、多任务追踪）。

### 4. 工具搜索（ToolSearchTool）

```typescript
// 当用户说"用什么工具能做 XX"时，自动搜索可用工具
```

**借鉴**：这是一个元工具，用于在不知道用什么工具时推荐工具。Hermes 还没有类似能力。

### 5. Skill 系统

Claude Code 的 skill 非常轻量：
- `src/skills/bundled/skillify.ts` — 把当前 session 流程打包成 skill
- `src/skills/bundled/loop.ts` — 定时执行 prompt
- `src/skills/bundled/remember.ts` — 记忆管理
- 目录结构：`skills/bundled/` + 动态加载外部 skill

**借鉴**：skillify 功能很有意思——自动把会话过程蒸馏成可复用 skill。Hermes 的 skill 系统更成熟，但可以学这个"从会话生成 skill"的思路。

### 6. MCP 集成

Claude Code 的 `MCPTool` 和 `McpAuthTool` 是标准 MCP 客户端实现。

**借鉴**：Hermes 已有 MCP 支持，可以对比检查兼容性。

---

## OpenClaw 强项（值得借鉴）

### 1. 多渠道架构（最成熟）

OpenClaw 支持 **30+ 消息渠道**，架构设计：
- 统一的消息抽象层
- 每个渠道是独立插件
- Gateway 统一处理路由

**借鉴**：Hermes 的 gateway 架构类似，但 OpenClaw 的渠道数量远超 Hermes。如果要增加更多渠道，参考 `plugin-sdk/channel-*` 系列。

### 2. Plugin SDK（生态核心）

```javascript
exports: {
  './plugin-sdk/core': './dist/plugin-sdk/core.d.ts',
  './plugin-sdk/channel-runtime': './dist/plugin-sdk/channel-runtime.d.ts',
  './plugin-sdk/agent-runtime': './dist/plugin-sdk/agent-runtime.d.ts',
  // ... 200+ 子模块
}
```

OpenClaw 的 plugin SDK 有 **200+ 子模块**，覆盖：
- Channel runtime（渠道运行时）
- Agent runtime（Agent 运行时）
- Provider setup（模型提供者设置）
- OAuth（认证）

**借鉴**：这是一个巨大的生态库。如果 Hermes 要增加对某个新渠道/模型的支持，可以先看 OpenClaw 的 plugin SDK 是否有现成实现。

### 3. Bootstrap 文件系统

OpenClaw 的 workspace 启动文件：
- `AGENTS.md` — 操作指令
- `SOUL.md` — 人格设定
- `TOOLS.md` — 工具使用规范
- `BOOTSTRAP.md` — 首次运行引导
- `IDENTITY.md` — Agent 身份
- `USER.md` — 用户信息

**借鉴**：Hermes 的 `~/.hermes/` 结构更简洁，但 OpenClaw 的 Bootstrap 文件概念更面向用户（用户可以编辑这些文件来定制 Agent 行为）。

### 4. WebSocket Gateway

OpenClaw 的 gateway 用 WebSocket 连接所有客户端（CLI、App、Web UI、移动端）。协议设计：
- Request/Response 模式
- Server Push 事件
- 设备配对和认证

**借鉴**：Hermes 的 gateway 架构类似，但 OpenClaw 的协议更成熟（有完整的 schema 定义）。

---

## Hermes 强项（保持领先）

### 1. Skill 系统最完善

| 方面 | Claude Code | OpenClaw | Hermes |
|------|-------------|----------|--------|
| Skill 数量 | ~20 内置 | ~53 迁移 | **更丰富** |
| Skill 格式 | 简单 TS | 简单 | **SKILL.md + refs** |
| Skill 市场 | 无 | ClawHub | **Skill Hub** |
| Skill 创建 | 手动 | 手动 | **skill-creator** |

### 2. 多渠道整合

Hermes 已经整合了飞书等中国平台，OpenClaw 虽然也支持飞书但配置更复杂。

### 3. Cron 调度

Hermes 有内置 cron 系统，OpenClaw 用 `/loop` 命令，Claude Code 用 `ScheduleCronTool`。

### 4. Python 生态

Python 拥有更丰富的 AI/ML 工具链集成能力。

---

## 关键差距与机会

| 差距 | 竞品参考 | 改进建议 |
|------|----------|----------|
| 任务系统 | Claude Code 5个Task工具 | 增强 task 输出和停止能力 |
| 工具搜索 | Claude Code ToolSearchTool | 添加"推荐工具"功能 |
| Skill 生成 | Claude Code skillify | 实现"从会话生成 Hermes Skill" |
| 渠道数量 | OpenClaw 30+ | 接入更多中国平台 |
| Plugin SDK | OpenClaw 200+ 子模块 | 复用 OpenClaw 渠道实现 |

---

## 竞品源码位置

| 系统 | 位置 |
|------|------|
| Claude Code 2.1.88 源码 | `/mnt/d/Claude-Code-Src/src/` |
| OpenClaw | `/mnt/c/Users/ypeng/AppData/Roaming/npm/node_modules/openclaw/` |
| 已迁移 OpenClaw Skills | `~/.hermes/skills/openclaw-imports/` |

详细命令/工具清单见 `references/detailed-inventory.md`
