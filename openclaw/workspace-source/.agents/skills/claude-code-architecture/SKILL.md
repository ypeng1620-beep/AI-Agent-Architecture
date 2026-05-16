---
name: claude-code-architecture
description: Claude Code 2.1.88 源码架构参考 — 研究 CLI Agent 设计的知识库。当需要了解 Claude Code 的架构设计、命令系统、工具系统、skill 系统、MCP 集成、或需要对比参考其他 CLI Agent 实现时使用此 skill。
---

# Claude Code 架构参考

Claude Code 2.1.88 是从 npm 包中通过 source map 还原的源码版本。

## 源码位置

- 源码：`/mnt/d/Claude-Code-Src/src/`
- README：`/mnt/d/Claude-Code-Src/README.md`

## 核心架构

```
src/
├── entrypoints/     # CLI 入口与初始化
├── commands/        # 101 个命令实现
├── tools/           # 43 个工具实现
├── skills/          # Skill 系统
│   └── bundled/     # 17 个内置 skill
├── assistant/       # Session 历史管理
├── cli/             # CLI 核心
├── components/      # React + Ink 终端 UI
├── context/         # 上下文管理
├── coordinator/     # 任务协调
├── hooks/           # 交互状态管理
├── ink/             # 终端渲染基础设施
├── query/           # 查询引擎
├── server/          # 服务器组件
├── services/        # 核心业务逻辑
├── state/           # 状态管理
├── tasks/           # 任务系统
├── tools.ts         # 工具入口
├── types/           # 类型定义
└── utils/           # 工具函数
```

## 命令系统

101 个命令，分布在：
- `commands/` 目录（纯命令）
- `commands.ts` 文件（命令定义）

关键命令示例：
- `brief` — 任务简报
- `btw` — 侧聊
- `cost` — 成本追踪
- `debug-tool-call` — 工具调用调试
- `compact` — 上下文压缩
- `doctor` — 诊断

## 工具系统（43个）

核心工具类：
- `BashTool` — 执行 shell 命令
- `FileReadTool/FileWriteTool/FileEditTool` — 文件操作
- `GlobTool/GrepTool` — 搜索
- `WebSearchTool/WebFetchTool` — Web 获取
- `TaskCreateTool/TaskGetTool/TaskListTool/TaskUpdateTool` — 任务管理
- `MCPTool` — MCP 协议集成
- `AgentTool` — 子 Agent 调用
- `LSPTool` — Language Server Protocol
- `TodoWriteTool` — 待办事项
- `SendMessageTool` — 发送消息
- `ScheduleCronTool` — 定时任务

## Skill 系统

路径：`src/skills/`
- `bundledSkills.ts` — 内置 skill 加载
- `loadSkillsDir.ts` — 从目录加载 skill
- `mcpSkillBuilders.ts` — MCP skill 构建器
- `bundled/` — 17 个内置 skill（batch, claudeApi, debug, loop, remember, scheduleRemoteAgents, skillify, verify 等）

## UI 系统

基于 **React + Ink**（React 的终端渲染引擎）构建复杂交互界面：
- `components/` — React 组件
- `ink.ts` — 渲染基础设施
- `dialogLaunchers.tsx` — 对话框
- `keybindings/` — 键盘绑定
- `screens/` — 屏幕

## 入口流程

```
entrypoints/main.tsx → cli/ → coordinator/ → tools/ + commands/
                              ↓
                         assistant/ (session history)
```

## 与 Hermes 的关键差异

| 方面 | Claude Code | Hermes |
|------|-------------|--------|
| 工具调用 | Pi agent core | 内置 tool registry |
| Skill 加载 | 目录扫描 + MCP | ~/.hermes/skills/ |
| 命令系统 | commands/ 目录 | hermes_cli/commands.py |
| 多渠道 | 无（单 CLI） | Gateway 多渠道 |
| UI | React + Ink | Rich + prompt_toolkit |
