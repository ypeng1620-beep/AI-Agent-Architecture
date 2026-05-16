---
name: anthropic-monitor
version: 1.0.0
description: 监控 Anthropic 工程博客，检测新文章，提取关键信息，按分流角度分析机会。适用于 AI/工具方向研究。
triggers: ["监控 anthropic", "anthropic 新文章", "anthropic engineering"]
---

# Anthropic Monitor

监控 anthropic.com/engineering 工程博客，检测并分析新产品/技术方向。

## 工作流程

### 1. 抓取文章列表
使用 Browserbase 访问：
- https://www.anthropic.com/engineering （主列表页）
- 对每篇感兴趣的文章获取全文

备选：curl 直接抓取（WSL 网络可能超时，但值得一试）

### 2. 检测新文章
读取上次状态 `~/.hermes/cache/anthropic-monitor/last_check.json`，对比时间戳。

### 3. 分析要点
对每篇新文章提取：
- **核心功能**：文章在说什么技术/产品
- **关键数据**：Anthropic 给出的量化指标（准确率、延迟、上下文节省%）
- **差评痛点**：有什么对使用者不友好的地方（配置复杂、门槛高、需要云端等）
- **分流机会**：如果做一个"更简单的版本"或"本地版"或"轻量版"的机会

### 4. 输出格式
```markdown
# Anthropic 工程博客更新 — YYYY-MM-DD

## 新文章（N篇）

### 文章标题
- **发布时间**：YYYY-MM-DD
- **核心功能**：一句话描述
- **关键数据**：量化指标
- **差评痛点**：对使用者不友好的点
- **分流机会**：微型替代方向 + 落地速度评估

## 结论
- 本次新文章数量：N
- 最高价值分流机会：1个
```

### 5. 保存 & 推送
- 完整报告保存到：`~/wiki/raw/articles/anthropic-{date}.md`
- 如果有高价值发现，更新 `~/wiki/entities/anthropic-agent-engineering.md`
- 发现分流机会时，推送到飞书

## 技术细节

### Browserbase 访问
```python
# 伪代码
from browserbase import Browserbase
bb = Browserbase()
session = bb.create_session()
session.navigate("https://www.anthropic.com/engineering")
# 获取文章列表快照
# 对每篇文章获取全文内容
```

### 状态文件
```json
// ~/.hermes/cache/anthropic-monitor/last_check.json
{
  "last_check": "2026-04-18",
  "articles_seen": ["article-1", "article-2", ...],
  "last_article_date": "2026-04-17"
}
```

### WSL curl 备选方案
如果 Browserbase 不可用，尝试：
```bash
curl -sL "https://www.anthropic.com/engineering" | grep -o 'href="/engineering/[^"]*"' | head -20
```
注意：WSL 直连 anthropic.com 会被代理拦截（403 Forbidden），Browserbase 是主要方案。

## 使用示例
```
用户：监控一下 anthropic 的新文章
→ 执行 anthropic-monitor 技能
→ 抓取列表 → 检测新文章 → 分析分流机会 → 保存到 wiki → 推送飞书
```

## 依赖
- Browserbase（主要网络方案）
- 文件系统读写
- 飞书推送（可选）

## 频率
建议每日一次（凌晨 00:30 较佳，比每日产品方向扫描晚30分钟）
