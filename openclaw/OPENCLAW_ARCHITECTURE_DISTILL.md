# OpenClaw 架构蒸馏

> 基于 OpenClaw 源码分析 + 运行时探查

## 整体架构图

```
用户请求（飞书/微信/Web/Discord/Telegram）
    │
    ▼
Gateway（消息网关）
    │
    ├─> Channel Handler（渠道适配）
    │       ├─> FeishuAdapter
    │       ├─> WeChatAdapter
    │       ├─> WebChatAdapter
    │       ├─> DiscordAdapter
    │       └─> TelegramAdapter
    │
    ├─> Session Manager（会话管理）
    │       ├─> Session 缓存（token budget 管理）
    │       ├─> Message History
    │       └─> Context Compaction
    │
    ├─> Agent Router（Agent 分发）
    │       └─> Agent Registry → main / cheng_cai / ...
    │
    └─> Delivery（结果投递）
            └─> Cron / Webhook / Direct

Agent 执行层
    │
    ├─> Skills（技能系统）
    │       ├─> Built-in Skills（~/.agents/skills/）
    │       ├─> Extension Skills（extensions/*/skills/）
    │       └─> Hermes 迁移技能（128 个）
    │
    ├─> Tools（工具集）
    │       ├─> exec / read / write / edit
    │       ├─> web_search / web_fetch
    │       ├─> cron / sessions_* / subagents
    │       ├─> image / music_generate / video_generate
    │       └─> mcp_* (MCP 工具桥接)
    │
    └─> Memory（记忆系统）
            ├─> MEMORY.md（长期记忆）
            ├─> memory/YYYY-MM-DD.md（每日记忆）
            ├─> knowledge/index.js（知识索引）
            └─> memory/*.md（技能/项目专项记忆）
```

---

## 核心模块分析

### 1. Gateway（消息网关）
**职责：** 多渠道消息统一接入、分发、路由

**核心流程：**
```
Inbound Message → ChannelParser → SessionResolver → AgentRouter → Handler → Delivery
```

**关键设计：**
- 所有渠道共用同一套 Session 机制
- `contextToken` 用于跨 session 恢复
- `delivery` 配置支持 announce/webhook/none

### 2. Session Manager
**职责：** 会话状态管理、上下文维护、token budget

**缓存策略：**
| 渠道 | 缓存大小 |
|------|---------|
| 电脑端主 Session | 100k tokens |
| 飞书端 | 50k tokens |

**状态文件：** `completions/` — Session 压缩包（zip）

### 3. Skills 系统
**路径：** `~/.agents/skills/` + `extensions/*/skills/`

**SKILL.md 格式：**
```yaml
---
name: skill-name
description: 技能描述
---
# 技能名称

## 功能
...
```

**技能分类：**
- 内置技能：weather, akshare-stock, github, research, seo-content-writer 等
- 扩展技能（clawhub）：clawhub, gh-issues, find-skills 等
- Hermes 迁移：128 个（arxiv, github-issues, anthropic-monitor 等）

### 4. Agent 系统
**类型：**
- `main` — 主 Agent（总管，承安）
- `isolated` — 独立 Session（隔离执行）
- `subagent` — 子 Agent（任务分解）

**Session 隔离：**
- `isolated` Session：HTTP 客户端连接不稳定（已知问题）
- `main` Session：稳定，不受影响

### 5. Cron 调度
**路径：** `~/.openclaw/cron/`

**Job Schema：**
```typescript
{
  name: string
  schedule: { kind: 'cron' | 'every' | 'at', ... }
  sessionTarget: 'main' | 'isolated' | 'current' | 'session:<id>'
  payload: { kind: 'systemEvent' | 'agentTurn', ... }
  delivery: { mode: 'none' | 'announce' | 'webhook', ... }
}
```

### 6. Tools 系统
**核心工具：**
| 工具 | 功能 |
|------|------|
| exec | Shell 命令执行 |
| read/write/edit | 文件操作 |
| cron | 定时任务管理 |
| sessions_* | Session 管理 |
| subagents | 子 Agent 编排 |
| web_search/fetch | 网络访问 |
| image/music/video | 多模态生成 |
| mcp_* | MCP 协议桥接 |

### 7. Memory 系统
**层级：**
1. **MEMORY.md** — 长期记忆（用户偏好、项目、技能）
2. **memory/YYYY-MM-DD.md** — 每日记忆（raw logs）
3. **knowledge/index.js** — 知识索引（语义搜索）
4. **memory/*.md** — 专项记忆（skill-forge-log, user-profile 等）

---

## 与其他系统对比

| 维度 | Hermes Agent | Claude Code | OpenClaw |
|------|-------------|-------------|----------|
| **入口** | `cli.py` | `cli.tsx` (Bun) | Gateway |
| **UI** | CLI + Web | React+Ink终端 | 多渠道消息 |
| **工具定义** | Python function | `buildTool<T>()` | SKILL.md |
| **MCP** | 不支持 | 完整支持 | MCP Hub |
| **多Agent** | 有限 | AgentTool + Coordinator | subagents |
| **插件系统** | 无 | Plugin Registry | Extension Hub |
| **记忆** | trajectory + compression | Session压缩 | 分层记忆系统 |
| **传输** | WebSocket | SSE + WS | WebSocket |

---

## OpenClaw 独特优势

1. **多渠道统一**：一个 Agent 对接所有消息渠道
2. **Session 缓存**：跨渠道共享上下文
3. **Skills 生态**：205 个技能，即插即用
4. **记忆分层**：短期/长期/知识索引分离
5. **Cron + Delivery**：定时任务 + 消息推送一体化

---

## 关键文件路径

| 模块 | 路径 |
|------|------|
| Gateway | `~/.openclaw/` |
| Skills | `~/.agents/skills/` |
| Extensions | `~/.openclaw/extensions/` |
| Cron Jobs | `~/.openclaw/cron/` |
| Memory | `~/.openclaw/workspace/memory/` |
| Credentials | `~/.openclaw/credentials/` |
| Logs | `~/.openclaw/logs/` |
| Docs | `~/.openclaw/workspace/docs/` |
| Tasks | `~/.openclaw/workspace/tasks/` |
| Distillation | `~/.openclaw/workspace/distillation/` |

---

## 技术债（已知）

| 问题 | 状态 | 备注 |
|------|------|------|
| WeChat API 限速 | ⚠️ 待实现 | 指数退避方案未完成 |
| 微信推送队列 | 🟡 基础设施就绪 | 需 delivery 集成 |
| MiniMax TTS Token 2061 | ⚠️ 待老爷 | 需升级套餐 |
| isolated session 超时 | 🔴 已知问题 | LLM 超时，L1缓存正常 |

---

*文档生成：2026-04-21*
*数据来源：OpenClaw 源码分析 + 运行时探查*
