# AI Agent 架构对比研究

> 三大 Agent 系统完整源码索引

## 目录结构

```
D:\AI-Agent-Architecture\
├── README.md                           ← 本文件
│
├── hermes-agent/                       (~11 MB)
│   ├── hermes-agent-main.zip          ← 完整源码（ZIP）
│   ├── HERMES_MEMORY_DISTILL.md        ← Memory System 蒸馏
│   ├── HERMES_EVOLVE_DISTILL.md       ← 自我进化机制蒸馏
│   ├── SKILL_FORGE_DISTILL.md         ← SkillForge 蒸馏
│   ├── HERMES_85_SKILLS_DISTILL.md    ← 85 技能分析
│   └── HERMES_AGENT_SOURCE.txt         ← 源码说明
│
├── claude-code/                        (~30 MB, 1905 文件)
│   ├── README.md
│   ├── CLAUDE_CODE_ARCHITECTURE_DISTILL.md  ← 完整架构分析
│   ├── CLAUDE_CODE_CODING_WORKFLOW_DISTILL.md ← TDD/调试流程
│   └── src/                           ← 完整 TypeScript 源码（1902 文件）
│       ├── entrypoints/               ← CLI 入口
│       ├── commands/                  ← 90+ 命令实现
│       ├── tools/                     ← 42 工具
│       ├── services/                  ← 核心服务
│       ├── skills/                    ← Skills 系统
│       ├── plugins/                   ← 插件系统
│       ├── coordinator/               ← Agent 协调
│       ├── components/                ← React 组件
│       ├── ink/                       ← 终端渲染
│       ├── server/                    ← MCP Server
│       └── ...
│
└── openclaw/                          (~111 MB, 1441 文件)
    └── workspace-source/
        ├── distillation/               ← 四大蒸馏文档
        ├── docs/                      ← OpenClaw 文档
        ├── knowledge/                 ← 知识索引系统（64 MB）
        ├── memory/                    ← 每日记忆 + MEMORY.md
        ├── skills/                    ← 205 个技能（含 128 个 Hermes 迁移）
        ├── tasks/                     ← Phase 4 利器工具
        ├── .agents/                   ← Agent 配置
        ├── scripts/                   ← 工具脚本
        └── ...
```

## 文件统计

| 系统 | 文件数 | 大小 |
|------|--------|------|
| Hermes Agent | 6 | 10.5 MB |
| Claude Code | 1,905 | 29.5 MB |
| OpenClaw | 1,441 | 110.7 MB |
| **总计** | **3,352** | **~151 MB** |

## 源码位置

| 系统 | 原始源码位置 |
|------|------------|
| Hermes Agent | D:\hermes-agent-main.zip |
| Claude Code | D:\Claude-Code-Src\src\ |
| OpenClaw | C:\Users\ypeng\.openclaw\workspace\ |

## 蒸馏文档清单

### Hermes Agent
- `HERMES_MEMORY_DISTILL.md` — Memory System：trajectory compression + 状态管理
- `HERMES_EVOLVE_DISTILL.md` — Self-Improvement：evolve system + trajectory compressor
- `SKILL_FORGE_DISTILL.md` — SkillForge：技能自创建流程
- `HERMES_85_SKILLS_DISTILL.md` — 85 技能全部分析

### Claude Code
- `CLAUDE_CODE_ARCHITECTURE_DISTILL.md` — 完整架构（CLI/QueryEngine/Tool/MCP/UI）
- `CLAUDE_CODE_CODING_WORKFLOW_DISTILL.md` — TDD + Systematic Debugging 流程

### OpenClaw
- `distillation/` — 四大 Phase 完整蒸馏文档

---

*生成时间：2026-04-21*
