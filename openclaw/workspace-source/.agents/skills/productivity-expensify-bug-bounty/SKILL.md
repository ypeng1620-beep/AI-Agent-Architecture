---
name: expensify-bug-bounty
description: Expensify Bug Bounty 抢单攻略 — 通过 GitHub API 直接提交 Proposal，无需浏览器自动化
triggers:
  - expensify bug bounty
  - expensify help wanted
  - 抢 expensify bug
---

# Expensify Bug Bounty 抢单攻略

## 核心发现

### 自动化限制
- **Upwork**：Cloudflare 保护，Browsertbase 被墙，自动化登录行不通
- **GitHub**：无验证码，直接用 API 提交 Comment 完全没问题
- **邮件/短信验证码**：可截图给 AI 帮忙填，但 Upwork 登录这关过不去

### 实际可行方案
只需 GitHub 账号 + API Token，Upwork 不是必填项（先占坑更重要）

---

## 抢单流程（GitHub API 手动版）

### 1. 找 Bug
```
https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22+no%3Aassignee
```

### 2. 查评论（确认没人抢）
```bash
curl -s "https://api.github.com/repos/Expensify/App/issues/{issue_number}/comments" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'评论数: {len(d)}'); [print(f'@ {c[\"user\"][\"login\"]}: {(c[\"body\"] or \"\")[:200]}') for c in d]"
```

### 3. 提交 Proposal（两个 Comment）
```bash
TOKEN="${GITHUB_TOKEN}"
REPO="Expensify/App"
ISSUE=88039

# Comment 1: Proposal
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  "https://api.github.com/repos/$REPO/issues/$ISSUE/comments" \
  -d '{"body":"## Proposal\n\n### What is the root cause of that problem?\n[根因分析]\n\n### What is the fix?\n[修复方案]\n\n### What testing is needed?\n1. [测试步骤]\n"}'

# Comment 2: Contributor details
curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/repos/$REPO/issues/$ISSUE/comments" \
  -d '{"body":"Contributor details:\n- GitHub: https://github.com/你的GitHub用户名\n- Upwork: [你的Upwork链接]\n"}'
```

---

## Proposal 格式模板

```markdown
## Proposal

### What is the root cause of that problem?
[描述根因，引用具体文件路径和代码]

### What is the fix?
[描述修复方案，具体到文件和改动点]

### What testing is needed?
1. [复现步骤]
2. [验证修复]
```

---

## 经验总结

1. **Bot Proposal 不算数**：MelvinBot、OSBotify 写了分析不代表有人抢，真人才算
2. **DeployBlocker 优先**：标签带 `DeployBlockerCash` 的 Bug 高优先级
3. **先占坑再说**：Proposal 质量差不多就行，先提交占位
4. **Upwork 可以后补**：Contributor details 里 Upwork 链接不是必须的
6. **WSL 令牌可用**：GitHub Token 在 WSL 环境下 curl 正常访问 GitHub API
7. **execute_code 沙盒限制**：`execute_code` 运行在独立沙盒中（`/tmp/hermes_sandbox_*`），无法访问 `~/.hermes/scripts/.token_github` 等用户文件。如需通过脚本检查分配，必须用 `terminal` 工具而非 `execute_code`，或直接从环境变量（`GITHUB_TOKEN`）读取令牌。
6. **GitHub API 比浏览器更好用**：Browserbase 会被 Cloudflare 拦截，但 API 调用完全正常

---

## 实战结论（2026-04-16 实测）

### 残酷真相
- **Help Wanted Bug 总量**：~50个，48个有 Owner，真正无主的仅2个
- **抢单窗口极短**：新 Bug 放出后 1 天内被抢光，竞争极激烈
- **几乎所有 heroku/now.sh API 已下线**：Bug 里引用的 API 大量返回 404/HTTP 502
- **真正可用的 API**（约10个）：Frankfurter、Open-Meteo、DummyJSON、SWAPI、HTTP Cat、PlaceDog 等

### 网络问题（WSL）
- `api.github.com` DNS 间歇性解析到 `198.18.0.x` 代理 IP，导致 curl 超时
- Browserbase 浏览器工具可访问 GitHub（部分情况比 direct API 更稳定）
- `curl github.com` 可用但 `curl api.github.com` 经常超时

### 账号状态
- **账号**: ypeng1620-beep
- **Token**: 存在 `~/.hermes/scripts/expensify_check.py` 里（不要提交到技能）
- **已占坑但未分配**：
  - #88039（Enter不保存过滤器）— 有其他 Proposal 在排队
  - #88040（Undelete按钮截断）— 有人在讨论根因
  - #88036（Undelete离线禁用）— 无动态

### 建议策略调整
1. **不要再花时间找无主 Bug**：基本没有了，有也都是竞争极激烈
2. **关注 OS Botify/MelvinBot 的自动分析**：这些 Bot 会自动分析 Bug 根因，可以参考它们的分析来写 Proposal
3. **Browserbase 备份方案**：当 GitHub API 超时，可尝试用 browser 工具操作 GitHub 网页版
4. **Wiki 有完整攻略**：`~/wiki/expensify-bug-bounty.md`（内容比 skill 更详细）

### 自动化脚本
- 状态监控: `~/.hermes/scripts/expensify_check.py`（cronjob: 每2小时）
- 修复PR脚本: `~/.hermes/scripts/expensify_auto_fix.py`
- 状态文件: `~/.hermes/scripts/.expensify_state.json`

---

## 后续流程

1. **持续监控**（2小时cronjob）：等被分配，被分配后 48 小时内要提交 PR
2. **提交PR**：分配后运行 `python3 ~/.hermes/scripts/expensify_auto_fix.py <issue_num>`
3. **等待审核**：继续监控，等 C+ 和作者审核
4. **收款**：PR 被 merge 后等汇款

---

## 相关资源

- Wiki攻略：`~/wiki/expensify-bug-bounty.md`
- Proposal草稿：`~/wiki/expensify-proposal-draft.md`
