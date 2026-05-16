---
name: github-issues
description: GitHub Issues 管理技能。创建、搜索、分类、管理 Issue，支持 gh CLI 和 curl 两种方式。
triggers:
  - "GitHub Issue"
  - "创建 Issue"
  - "管理 Issue"
  - "gh issue"
---

# GitHub Issues 管理

创建、搜索、分类、管理 GitHub Issue。支持 `gh` CLI 和 curl 两种方式。

## 前置准备

```bash
# 检测 gh CLI 是否可用
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  AUTH="gh"
else
  AUTH="curl"
  # curl 方式需要 GITHUB_TOKEN
fi

# 从 git remote 推断 OWNER/REPO
REMOTE_URL=$(git remote get-url origin)
OWNER_REPO=$(echo "$REMOTE_URL" | sed -E 's|.*github\.com[:/]||; s|\.git$||')
OWNER=$(echo "$OWNER_REPO" | cut -d/ -f1)
REPO=$(echo "$OWNER_REPO" | cut -d/ -f2)
```

## 1. 查看 Issue

**gh:**
```bash
gh issue list
gh issue list --state open --label "bug"
gh issue list --assignee @me
gh issue view 42
```

**curl:**
```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/issues?state=open&per_page=20"
```

## 2. 创建 Issue

**gh:**
```bash
gh issue create \
  --title "Bug: 登录后重定向错误" \
  --body "## 描述\n登录后总是跳转到 /dashboard，应该跳转到 ?next= 参数指定的页面。\n\n## 复现步骤\n1. 访问 /settings（未登录）\n2. 被重定向到 /login?next=/settings\n3. 登录\n4. 实际跳转到 /dashboard\n\n## 预期行为\n尊重 ?next= 查询参数。" \
  --label "bug" \
  --assignee "username"
```

**curl:**
```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues \
  -d '{
    "title": "Bug: 登录后重定向错误",
    "body": "## 描述\n...",
    "labels": ["bug"]
  }'
```

## 3. 管理标签

**添加标签:**
```bash
gh issue edit 42 --add-label "priority:high,bug"
```

**curl:**
```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42/labels \
  -d '{"labels": ["priority:high", "bug"]}'
```

**查看可用标签:**
```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/labels | python3 -c "
import sys, json
for l in json.load(sys.stdin):
    print(f\"  {l['name']:30}  {l.get('description', '')}\")"
```

## 4. 分配责任人

```bash
gh issue edit 42 --add-assignee username
gh issue edit 42 --add-assignee @me
```

**curl:**
```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42/assignees \
  -d '{"assignees": ["username"]}'
```

## 5. 评论

```bash
gh issue comment 42 --body "已定位到问题，正在修复。"
```

**curl:**
```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42/comments \
  -d '{"body": "已定位到问题，正在修复。"}'
```

## 6. 关闭/重新打开

```bash
gh issue close 42
gh issue close 42 --reason "not planned"
gh issue reopen 42
```

**curl:**
```bash
# 关闭
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42 \
  -d '{"state": "closed", "state_reason": "completed"}'

# 重新打开
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42 \
  -d '{"state": "open"}'
```

## 7. Issue 分类工作流

当需要分类 Issue 时：

1. **列出待分类 Issue:**
```bash
gh issue list --label "needs-triage" --state open
```

2. **查看并分类** 每个 Issue

3. **添加标签和优先级**

4. **分配** 负责人

5. **评论** 分类说明

## 8. 批量操作

**批量关闭:**
```bash
# 关闭所有带 wontfix 标签的 Issue
gh issue list --label "wontfix" --json number --jq '.[].number' | \
  xargs -I {} gh issue close {} --reason "not planned"
```

## 快速参考

| 操作 | gh | curl 端点 |
|------|-----|----------|
| 列出 | `gh issue list` | `GET /repos/{o}/{r}/issues` |
| 查看 | `gh issue view N` | `GET /repos/{o}/{r}/issues/N` |
| 创建 | `gh issue create ...` | `POST /repos/{o}/{r}/issues` |
| 添加标签 | `gh issue edit N --add-label ...` | `POST /repos/{o}/{r}/issues/N/labels` |
| 分配 | `gh issue edit N --add-assignee ...` | `POST /repos/{o}/{r}/issues/N/assignees` |
| 评论 | `gh issue comment N --body ...` | `POST /repos/{o}/{r}/issues/N/comments` |
| 关闭 | `gh issue close N` | `PATCH /repos/{o}/{r}/issues/N` |
| 搜索 | `gh issue list --search "..."` | `GET /search/issues?q=...` |

## Issue 模板

**Bug 模板:**
```
## Bug 描述
<发生了什么>

## 复现步骤
1. <步骤>
2. <步骤>

## 预期行为
<应该发生什么>

## 实际行为
<实际发生了什么>
```

**功能请求模板:**
```
## 功能描述
<想要什么>

## 动机
<为什么有用>

## 建议方案
<如何实现>

## 备选方案
<其他方案>
```
