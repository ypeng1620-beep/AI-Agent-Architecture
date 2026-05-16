---
name: clawhub-skill-manager
description: Search, inspect, validate safety, and install skills from ClawHub. Use when running as a cron job to proactively install useful skills, or whenever you need to find and add new capabilities from clawhub.com.
tags: [clawhub, skill-management, openclaw, automation]
metadata:
  author: hermes-agent
  version: "1.0.0"
  updated: "2026-04-16"
---

# ClawHub Skill Manager | 从 ClawHub 搜索、检查并安装技能

## 典型触发场景

- "每天自动安装可能有用的新技能"
- "搜索并安装X相关的技能"
- 任何需要从 ClawHub 生态扩展能力的时候

## 工作流程（按顺序执行）

### 第一步：安装 CLI（如尚未安装）
```bash
npm i -g clawhub  # 安装后可用 `clawhub` 命令
# 或直接用 npx 调用：
npx clawhub@latest search "关键词"
```

### 第二步：搜索技能
```bash
npx clawhub@latest search "关键词"     # 单次搜索
npx clawhub@latest search "A" 2>/dev/null; npx clawhub@latest search "B" 2>/dev/null  # 并行搜索（注意超时）
```

### 第三步：检查技能详情
```bash
npx clawhub@latest inspect <slug>     # 获取技能元数据（summary、owner、version、license）
```

### 第四步：安全审查（重要！）
安装前务必检查 VirusTotal 警告。遇到 Rate limit 等 51 秒再试。

```bash
npx clawhub@latest install <slug> --no-input
# 如果出现 "flagged as suspicious by VirusTotal" 警告，
# 找到安全替代品再安装，不要用 --force 跳过
```

### 第五步：移动到正确目录（关键！）
```bash
# clawhub install 安装到 /home/ypeng/skills/<slug>（不是 ~/.hermes/hermes-agent/skills/！）
mv /home/ypeng/skills/<slug> ~/.hermes/skills/
```

**安装位置实测结果：**
- `clawhub install <slug>` → `/home/ypeng/skills/<slug>`（不是 `~/.hermes/hermes-agent/skills/<slug>`）
- Hermes Agent 读取 `~/.hermes/skills/<slug>`
- **skill 文档中 `~/.hermes/hermes-agent/skills/` 的路径是错误的**，不要用

### 第六步：验证
```bash
npx clawhub@latest list  # 确认技能已安装（显示的是安装位置，非 Hermes 读取位置）
```

## 已知问题

- **clawhub CLI 不在 PATH**：`clawhub` 命令不存在，必须用 `npx clawhub@latest` 调用（或先 `npm i -g clawhub` 安装）。
- **explore 命令返回空**：ClawHub 注册表的 explore 端点经常无结果，用 `search` 代替。
- **超时问题**：`clawhub search` 极易超时（60-90s），大量关键词搜索会超时，只有少数核心词返回结果。`inspect` 和 `install` 相对稳定。建议单次搜索集中火力，一次只搜一个关键词，超时则跳过。
- **Rate limit**：30 次请求/分钟限制，连续安装多个技能时会触发。遇到 "Rate limit exceeded" 需等 51 秒再重试。
- **VirusTotal 标记**：被标记的技能不要用 `--force` 强制安装，找替代品。标记过的技能包括：`feishu-toolkit`、`deep-research-openclaw-agent`、`feishu-bridge`、`quack-code-review`。
- **安装目录错误（高发）**：`clawhub install` 默认装到 `/home/ypeng/skills/<slug>`（不是 `~/.hermes/hermes-agent/skills/`！），安装后必须手动移动到 `~/.hermes/skills/`。

## 搜索策略

**实测稳定的关键词**（2026-04-19，ClawHub 网络极不稳定）：
- productivity、llm evaluation、deep research、coding、project management
- newsletter、rss、video、podcast、system design、prompt
- 这些词可以返回结果；大多数其他词会超时

| 需求方向 | 搜索关键词示例 |
|---------|--------------|
| 个人效率/知识管理 | "second brain", "notion", "obsidian", "knowledge" |
| 论文/学术研究 | "paper", "literature", "research", "arxiv" |
| 代码助手 | "code", "coding", "code-review" |
| 项目管理 | "project management", "task", "workflow" |
| 飞书生态 | "feishu", "lark" (ClawHub上较少，需结合现有技能判断) |
| 深度研究 | "deep research", "moss-deep-search" |

## 优先级参考

- 优先安装：文档完善、MIT-0 license、owner活跃、recently updated
- 跳过类型：被VirusTotal标记的、有外部eval/crypto key风险的
- 最多一次安装3个，避免贪多嚼不烂

## 安装标准检查清单

- [ ] 技能解决了用户真实痛点（不是伪需求）
- [ ] 与现有技能互补，不重复
- [ ] 文档清晰，有实际使用场景
- [ ] 无安全警告
- [ ] MIT-0 或类似宽松license
