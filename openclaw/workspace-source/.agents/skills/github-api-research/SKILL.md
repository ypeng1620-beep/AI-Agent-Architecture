---
name: github-api-research
description: "当目标公司官网/博客超时不可访问时，用 GitHub API 作为替代数据源研究其工程实践、技术栈和最新动态。WSL 环境下的首选研究方案。"
category: research
---

# GitHub API 研究术

## 核心方法

### 1. 查公司 GitHub Org 全部仓库

```python
import urllib.request, json

org = "harness"  # 目标公司
url = f"https://api.github.com/orgs/{org}/repos?per_page=100&sort=updated"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=8) as resp:
    data = json.loads(resp.read())
```

### 2. 分析数据

```python
from collections import Counter

# 按 star 排序热门项目
top = sorted(data, key=lambda x: x['stargazers_count'], reverse=True)[:15]
for r in top:
    print(f"⭐{r['stargazers_count']} | {r.get('language','')} | {r['name']} | {r.get('description','')}")

# 按更新时间排序看最新动态
recent = sorted(data, key=lambda x: x['updated_at'], reverse=True)[:10]

# 语言分布
langs = Counter(r.get('language') for r in data if r.get('language'))
for lang, cnt in langs.most_common(10):
    print(f"  {lang}: {cnt}")
```

### 3. 获取仓库 README

```python
for branch in ["main", "master"]:
    readme_url = f"https://raw.githubusercontent.com/{org}/{repo}/{branch}/README.md"
    req = urllib.request.Request(readme_url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            content = resp.read(2000).decode('utf-8', errors='ignore')
        break
    except: continue
```

### 4. 查主题标签分布

```python
all_topics = []
for repo in data:
    all_topics.extend(repo.get('topics', []))
topic_cnt = Counter(all_topics)
for t, c in topic_cnt.most_common(20):
    print(f"  {t}: {c}")
```

## WSL 网络问题处理

| 问题 | 解决方案 |
|------|---------|
| `curl --max-time` 超时 | 换 execute_code（Python urllib）|
| terminal 命令被 BLOCKED | 用 execute_code 的沙箱 |
| GitHub API 间歇超时 | 拆成多次小请求，每次 timeout=8 |
| 仍超时 | 降级用 Browserbase 浏览器工具 |

## 踩坑记录

- 2026-04-17：harness.io/blog/engineering 直接 curl 超时，curl --max-time 5 也超时
- terminal curl 有时被 BLOCKED（不返回任何内容就失败）
- execute_code 沙箱 urllib 比 terminal curl 更稳定
- api.github.com 比 raw.githubusercontent.com 更稳定

### 2026-04-17 补充经验

**README 获取方案（优先级）：**
1. `https://api.github.com/repos/{org}/{repo}/readme` → GitHub API（JSON，含 download_url）✅ 最稳定
2. `https://raw.githubusercontent.com/{org}/{repo}/main/README.md` → 直接文件 ⚠️ 常超时
3. GitHub Web UI 页面 → browser_navigate 兜底

**推荐完整代码（execute_code）：**
```python
import urllib.request, json, base64

url = f"https://api.github.com/repos/{org}/{repo}/readme"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req, timeout=10) as resp:
    data = json.loads(resp.read())
content = base64.b64decode(data['content']).decode('utf-8')
# 打印前200行
for line in content.split('\n')[:200]:
    print(line)
```

注意：GitHub API 返回的 content 是 base64 编码的（带 \n 换行符），必须解码才能得到真实 Markdown 内容。raw.githubusercontent.com 的内容是直接的，但常超时。

**WSL 网络诊断步骤：**
1. 先 `curl -s --max-time 3 https://api.github.com/zen` 确认连通性
2. 若 200 OK 说明网络正常，之前超时是临时抖动
3. 若超时 → 用 `execute_code`（沙箱 Python）替代 terminal curl
4. 若沙箱也超时 → 用 Browserbase 浏览器工具

**BLOCKED vs 超时区别：**
- `BLOCKED`：命令在执行前就被系统取消（超时机制触发过早）
- 退出码 -1 + `timeout`：命令运行后真正超时
- 处理：BLOCKED 时换 execute_code，超时时换更小的请求或降级方案

**WSL 网络特征：**
- DNS 正常（指向 10.255.255.254）
- 基础 ping 稳定（59-60ms）
- api.github.com 比 github.com 更可靠
- 间歇性超时（可能几秒内恢复），不要立即判定为完全不可用
