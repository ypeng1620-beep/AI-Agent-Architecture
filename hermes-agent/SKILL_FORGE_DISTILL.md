# Hermes SkillForge → 承安/承财 技能自创建 蒸馏方案

## 一、Hermes SkillForge 核心机制分析

### 1.1 技能创建触发点（来自 Session Log）

```markdown
## 技能自创建规则（Hermes session prompt）

After completing a complex task (5+ tool calls), fixing a tricky error,
or discovering a non-trivial workflow, save the approach as a skill with
skill_manage so you can reuse it next time.

When using a skill and finding it outdated, incomplete, or wrong,
patch it immediately with skill_manage(action='patch') — don't wait to be asked.
Skills that aren't maintained become liabilities.
```

**三大触发场景：**
1. **复杂任务完成**（5+ tool calls）→ 保存为 skill
2. **修复棘手错误** → 保存解决方案
3. **发现非平凡工作流** → 技能化复用

### 1.2 Skill 存储结构

```
~/.hermes/skills/
├── SKILL.md              # 技能定义（markdown + frontmatter）
├── [category]/
│   └── SKILL.md
└── index-cache/          # 技能索引缓存
```

**Frontmatter 格式：**
```yaml
---
name: skill-name
description: 技能描述
platforms: [linux, darwin, win32]  # 可选
---
# Skill Body

技能内容...
```

### 1.3 Skill 生命周期

```
创建 → 使用 → 发现问题 → Patch → 废弃
  ↑________|
  (定期评估)
```

### 1.4 技能分类体系（来自 Hermes）

```
skills/
├── autonomous-ai-agents/     # Agent 编排
├── software-development/      # 软件开发
├── mlops/                    # 机器学习运维
├── research/                 # 学术研究
├── productivity/             # 生产力工具
├── public-apis-*/            # API 集合（按类目）
└── ...
```

---

## 二、蒸馏目标（OpenClaw 适配）

### 2.1 OpenClaw 现有技能结构

```
~/.openclaw/workspace/.agents/skills/
├── akshare-stock/            # 股票
├── china-stock-analysis/      # A股分析
├── deep-research/             # 深度研究
├── gstack-*/                 # GStack 系列
├── writing-skills/            # 写作技能
└── ...
```

**差距分析：**
| 维度 | Hermes | OpenClaw | 蒸馏需求 |
|------|--------|---------|---------|
| 技能触发意识 | 5+ tool calls 自动提示 | 无 | 实现自动提示 |
| 技能 Patch | 发现即 patch | 无 | 实现自动 patch |
| 技能分类 | 200+ 分类 | 较少 | 扩展分类 |
| 技能索引 | FTS5 搜索 | 基础 | 强化搜索 |

---

## 三、Phase 3 实现方案

### 3.1 技能自创建触发机制

**新增文件：** `tasks/skill-forge-trigger.js`

```javascript
/**
 * 承安技能自创建触发器 v1.0
 * 蒸馏自 Hermes SkillForge
 * 
 * 功能：
 * 1. 跟踪工具调用次数
 * 2. 复杂任务（5+ tool calls）完成后自动提示创建 skill
 * 3. 发现非平凡解法 → 主动建议保存为 skill
 * 4. 使用 skill 出错 → 立即建议 patch
 * 
 * 触发条件：
 * - toolCallCount >= 5 → 复杂任务完成
 * - 发现错误解决方案 → 非平凡工作流
 * - 使用 skill 时发现问题 → 待 patch
 */

const SKILL_FORGE_DIR = 'C:/Users/ypeng/.openclaw/workspace/.agents/skills/';
const SKILL_LOG = 'C:/Users/ypeng/.openclaw/workspace/memory/skill-forge-log.md';

const TRIGGER_THRESHOLD = 5;  // 复杂任务阈值

// 触发检查函数（每轮对话后调用）
function checkSkillForgeTrigger(toolCallCount, taskDescription, outcome) {
  const suggestions = [];
  
  // 触发1: 复杂任务完成
  if (toolCallCount >= TRIGGER_THRESHOLD) {
    suggestions.push({
      type: 'CREATE',
      trigger: 'COMPLEX_TASK',
      message: `发现复杂任务完成（${toolCallCount} tool calls）：${taskDescription}。建议保存为 skill 以便复用。`,
      path: suggestSkillPath(taskDescription)
    });
  }
  
  // 触发2: 错误解决方案
  if (outcome.hadError && outcome.errorResolved) {
    suggestions.push({
      type: 'CREATE',
      trigger: 'ERROR_RESOLUTION',
      message: `发现错误解决方案：${outcome.errorDescription}。建议保存为 skill 避免重复踩坑。`,
      path: suggestSkillPath(outcome.errorDescription)
    });
  }
  
  // 触发3: skill 使用问题
  if (outcome.skillUsed && outcome.skillHadIssue) {
    suggestions.push({
      type: 'PATCH',
      trigger: 'SKILL_ISSUE',
      message: `Skill "${outcome.skillUsed}" 存在问题：${outcome.issueDescription}。建议立即 patch。`,
      path: outcome.skillPath
    });
  }
  
  return suggestions;
}

function suggestSkillPath(taskDescription) {
  // 根据任务描述推断技能路径
  const category = inferCategory(taskDescription);
  const name = sanitizeName(taskDescription);
  return `${SKILL_FORGE_DIR}${category}/${name}/SKILL.md`;
}

function inferCategory(task) {
  const keywords = {
    'stock': 'akshare-stock',
    '股票': 'akshare-stock',
    'github': 'github',
    'git': 'github',
    'research': 'deep-research',
    '研究': 'deep-research',
    '写': 'writing-skills',
    'code': 'software-development',
    '代码': 'software-development',
  };
  
  for (const [key, cat] of Object.entries(keywords)) {
    if (task.includes(key)) return cat;
  }
  return 'software-development';
}

function sanitizeName(desc) {
  return desc.substring(0, 30)
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
    .toLowerCase();
}
```

### 3.2 技能自创建模板

**文件路径：** `distillation/skill-forge/skill-template.md`

```markdown
---
name: [skill-name]
description: [一句话描述技能用途]
category: [分类：stock|github|research|code|writing|...]
platforms: [linux, darwin, win32]
author: 承安（蒸馏自 Hermes SkillForge）
version: 1.0
created: [YYYY-MM-DD]
tags: [tag1, tag2]
---

# [技能名称]

## 功能
[一句话描述]

## 使用场景
[何时使用此技能]

## 使用方法
\`\`\`
[具体命令或步骤]
\`\`\`

## 注意事项
- [注意点1]
- [注意点2]

## 更新日志
- [YYYY-MM-DD] v1.0 创建
```

### 3.3 技能 Patch 机制

**触发条件：**
- 使用某 skill 时发现错误/过时
- 发现更优方案
- Skill 依赖的 API 变更

**Patch 格式：**
```markdown
## 更新日志
- [YYYY-MM-DD] v1.1 patch: [修复内容]
  - 问题：[描述]
  - 修复：[方案]
- [YYYY-MM-DD] v1.0 创建
```

### 3.4 技能分类扩展计划

**目标分类（基于 Hermes 200+ 分类精简）：**

| 主类 | 子类 | 示例技能 |
|------|------|---------|
| stock |选股/分析/回测 | akshare-stock, china-stock-analysis |
| research | 论文/竞品/市场 | deep-research, arxiv-watcher |
| code | 项目/测试/调试 | software-development, systematic-debugging |
| writing | 文档/SEO/小红书 | seo-content-writer, write-xiaohongshu |
| ops | 部署/CI/监控 | deployment-automation, changelog-automation |
| data | 爬虫/ETL/可视化 | crawl4ai, akshare |

---

## 四、实施计划

| 阶段 | 内容 | 产出物 | 预计时间 |
|------|------|--------|---------|
| Phase 3.1 | 设计 skill 模板 | `skill-forge/skill-template.md` | 30 分钟 |
| Phase 3.2 | 实现触发检查函数 | `tasks/skill-forge-trigger.js` | 2 小时 |
| Phase 3.3 | 设计技能自创建流程 | 更新 AGENTS.md | 1 小时 |
| Phase 3.4 | 扩展技能分类 | 新增 5+ 技能 | 持续 |

---

## 五、验证方式

```bash
# 1. 检查技能日志
cat memory/skill-forge-log.md

# 2. 检查新创建技能
ls .agents/skills/[category]/

# 3. 验证 skill patch 记录
grep "patch" .agents/skills/*/SKILL.md
```

---

*蒸馏自 Hermes SkillForge | 分析时间: 2026-04-21*
