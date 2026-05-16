# Hermes 85 技能库 蒸馏报告

## 一、技能总量与分类

| 主类 | 子类数 | 代表技能 |
|------|--------|---------|
| **public-apis-*** | 50+ | finance(46API), weather, news, sports |
| **mlops/** | 8 | training, inference/*, models, vector-databases |
| **github/** | 6 | github-issues, github-code-review, github-pr-workflow |
| **research/** | 5 | arxiv, blogwatcher, llm-wiki, research-paper-writing |
| **software-development/** | 7 | systematic-debugging, test-driven-development, writing-plans |
| **其他** | 15+ | anthropic-intel, anthropic-monitor, creative, gaming, media |

**总计：85+ 个技能目录**

---

## 二、Skill 格式分析

### 标准结构
```
[category]/[skill-name]/SKILL.md
```

### SKILL.md 标准格式

**Frontmatter (YAML)：**
```yaml
---
name: skill-name
description: 一句话描述
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [Tag1, Tag2, Tag3]
    related_skills: [other-skill]
triggers:
  - "触发关键词1"
  - "触发关键词2"
---
# Markdown 正文
```

**正文结构（优秀技能）：**
1. **Overview** — 技能用途
2. **Prerequisites** — 前置条件
3. **Common Commands** — 常用命令（gh/curl 双版本）
4. **Workflow** — 具体工作流
5. **Examples** — 完整示例
6. **Troubleshooting** — 故障排除
7. **Notes** — 注意事项

---

## 三、高价值技能深度分析

### 3.1 systematic-debugging（系统性调试）

**位置：** `software-development/systematic-debugging/SKILL.md`

**核心机制：**
```
Phase 1: Root Cause Investigation（必须先完成）
    ↓
Phase 2: Generate Hypotheses
    ↓
Phase 3: Test Hypotheses
    ↓
Phase 4: Implement & Verify Fix
```

**Iron Law:**
```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

**触发场景：**
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures

**可迁移性：** ✅ 直接迁移到 OpenClaw
- 当前 OpenClaw 已有 `systematic-debugging` skill
- 可补充 Hermes 的 4-phase 框架

---

### 3.2 arxiv（学术论文搜索）

**位置：** `research/arxiv/SKILL.md`

**核心能力：**
| 功能 | 命令 |
|------|------|
| 搜索论文 | `curl "https://export.arxiv.org/api/query?search_query=all:GRPO+reinforcement+learning"` |
| 获取指定论文 | `curl "...id_list=2402.03300"` |
| 解析 XML | Python stdlib（无依赖）|
| BibTeX 生成 | 内置 Python 脚本 |
| 引用追踪 | Semantic Scholar API |
| 相关论文 | POST recommendations endpoint |

**特色功能：**
- Boolean 查询（AND/OR/NOT）
- 分类过滤（cs.AI, cs.CL, cs.LG 等）
- 排序（relevance/submittedDate/lastUpdatedDate）
- PDF 直接读取
- 版本固定（避免引用漂移）
- 论文撤回检测

**可迁移性：** ✅ 直接迁移
- OpenClaw 已有 `deep-research` skill
- arxiv 搜索命令可直接整合

---

### 3.3 github-issues（GitHub Issue 管理）

**位置：** `github/github-issues/SKILL.md`

**核心能力：**
| 功能 | gh | curl fallback |
|------|-----|---------------|
| 列出 issue | `gh issue list` | GitHub REST API |
| 查看 issue | `gh issue view 42` | `/repos/:owner/:repo/issues/:number` |
| 创建 issue | `gh issue create` | POST API |
| 添加标签 | `gh issue edit --add-label bug` | PATCH API |
| 搜索 | `gh issue search` | GraphQL |

**特色设计：**
- gh/curl 双版本保证可用性
- 自动从 `~/.hermes/.env` 读取 `GITHUB_TOKEN`
- 自动从 git remote 推断 `OWNER_REPO`
- 完整的 triage 工作流

**可迁移性：** ✅ 直接迁移
- OpenClaw 已有 `gh-issues` skill
- 可借鉴 curl fallback 机制

---

### 3.4 anthropic-monitor（Anthropic 博客监控）

**位置：** `anthropic-monitor/SKILL.md`

**核心工作流：**
```
1. Browserbase 抓取 anthropic.com/engineering
2. 对比 last_check.json 时间戳检测新文章
3. 提取：核心功能 / 关键数据 / 差评痛点 / 分流机会
4. 保存报告 + 推送飞书
```

**状态管理：**
```json
// ~/.hermes/cache/anthropic-monitor/last_check.json
{
  "last_check": "2026-04-18",
  "articles_seen": ["article-1", ...],
  "last_article_date": "2026-04-17"
}
```

**可迁移性：** ✅ 直接迁移
- 当前 OpenClaw 无 equivalent skill
- 适合创建 `anthropic-news-monitor` skill

---

### 3.5 blogwatcher（RSS 博客监控）

**位置：** `research/blogwatcher/SKILL.md`

**核心能力：**
| 功能 | 命令 |
|------|------|
| 添加博客 | `blogwatcher-cli add "My Blog" https://example.com` |
| 扫描更新 | `blogwatcher-cli scan` |
| 查看未读 | `blogwatcher-cli list` |
| 标记已读 | `blogwatcher-cli read <id>` |

**安装方式：**
- Go: `go install`
- Docker: `docker run`
- Binary: 直接下载

**可迁移性：** ✅ 可迁移
- 需要 `blogwatcher-cli` 工具
- 适合创建 RSS 监控类 skill

---

### 3.6 anthropic-intel（Anthropic 情报分析）

**位置：** `anthropic-intel/SKILL.md`

**输出格式：**
```
## [功能/趋势名称] 分流机会评估

### 一、痛点分析
### 二、竞品短板
### 三、落地速度评估
### 四、价格锚点建议
```

**情报来源（三路并行）：**
1. Anthropic 官方（产品功能、定价、路线图）
2. 公开信息（TechCrunch / VentureBeat）
3. 竞品动态（OpenAI / Google / Meta）

**可迁移性：** ✅ 可迁移
- 适合创建 `tech-intel-monitor` skill

---

### 3.7 public-apis-finance（免费金融 API）

**位置：** `public-apis-finance/SKILL.md`

**收录 API：46 个金融相关免费 API**

| 名称 | 认证 | 用途 |
|------|------|------|
| Alpha Vantage | apiKey | 实时股票数据 |
| Finnhub | apiKey | 股票货币加密 |
| Yahoo Finance | apiKey | 股票加密货币外汇 |
| Polygon | apiKey | 历史股票数据 |
| Alpaca | apiKey | 股票市场数据 |
| SEC EDGAR | No | 美国公司年报 |
| FRED | apiKey | 经济数据 |

**可迁移性：** ✅ 可迁移
- 承财（股票agent）可直接使用这些 API
- 可整合到 `akshare-stock` skill

---

## 四、技能设计模式总结

### 4.1 优秀技能的共同特征

| 特征 | 说明 |
|------|------|
| **gh/curl 双版本** | 保证工具不可用时的 fallback |
| **状态文件** | 追踪进度，避免重复工作 |
| **完整示例** | 从安装到使用的每一步 |
| **Troubleshooting** | 常见错误及解决方案 |
| **Trigger 关键词** | 明确何时应该使用此技能 |
| **相关技能引用** | 形成技能网络 |

### 4.2 技能组织方式

```
category/
├── SKILL.md              # 分类总览
└── skill-name/
    └── SKILL.md          # 具体技能
```

### 4.3 Skill Frontmatter 标准字段

```yaml
---
name: skill-name
description: 一句话描述
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [Tag1, Tag2]
    related_skills: [other-skill]
triggers:
  - "触发关键词"
prerequisites:
  commands: [required-command]
---
```

---

## 五、蒸馏优先级建议

### 第一优先级（立即可用）
| 技能 | 原因 |
|------|------|
| arxiv | 学术研究核心工具，直接可用 |
| systematic-debugging | 调试框架已存在，可补充 |
| github-issues | 与现有 gh-issues 整合 |
| public-apis-finance | 补充承财的金融数据源 |

### 第二优先级（高价值新建）
| 技能 | 原因 |
|------|------|
| anthropic-monitor | 监控 AI 前沿，独特价值 |
| anthropic-intel | 分流机会分析，独特价值 |
| blogwatcher | RSS 监控，扩展能力 |
| tech-intel-monitor | 竞品监控，通用需求 |

### 第三优先级（长期建设）
| 技能 | 原因 |
|------|------|
| mlops/training | 模型训练，需要环境 |
| mlops/inference | 模型推理，需要 GPU |
| public-apis-* (50+) | 按需迁移 |

---

## 六、OpenClaw 技能目录结构建议

```
~/.openclaw/workspace/.agents/skills/
├── research/
│   ├── arxiv/                    # ✅ 迁移
│   ├── deep-research/            # ✅ 已有
│   └── tech-intel-monitor/       # 🆕 新建
├── stock/
│   ├── akshare-stock/            # ✅ 已有
│   └── public-apis-finance/      # 🆕 整合
├── debugging/
│   └── systematic-debugging/     # ✅ 已有（增强）
├── github/
│   └── gh-issues/                # ✅ 已有（增强）
├── monitoring/
│   ├── anthropic-monitor/        # 🆕 新建
│   └── blogwatcher/              # 🆕 新建
└── software-development/
    ├── test-driven-development/  # ✅ 已有
    └── writing-plans/            # ✅ 已有
```

---

*蒸馏分析完成 | 技能总数: 85+ | 分析时间: 2026-04-21*
