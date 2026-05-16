# NovelMaster Skill - 实现计划

> **For agentic workers:** Use subagent-driven-development to implement task-by-task.

**Goal**: 创建集大成的 AI 小说写作技能

**Architecture**: 模块化技能系统，JSON 文件存储

**Tech Stack**: Node.js, Markdown

---

## Task 1: 项目结构搭建

**Files:**
- Create: `skills/novel-master/SKILL.md`
- Create: `skills/novel-master/index.js`
- Create: `skills/novel-master/README.md`

- [ ] **Step 1: 创建目录和基础文件**

- [ ] **Step 2: 实现基础框架**

---

## Task 2: 雪花写作法模块

**Files:**
- Modify: `skills/novel-master/index.js`

- [ ] **Step 1: 实现一句话提炼**

```javascript
// 一句话核心：主角+目标+阻碍
async function oneSentenceCore(genre, theme) { ... }
```

- [ ] **Step 2: 实现一页大纲**

```javascript
// 一页大纲：起承转合四幕结构
async function onePageOutline(concept) { ... }
```

- [ ] **Step 3: 实现人物素描**

```javascript
// 人物设定卡
async function characterProfile(name, role) { ... }
```

- [ ] **Step 4: 实现详细大纲**

---

## Task 3: 章节生成模块

- [ ] **Step 1: 大纲转章节**

```javascript
async function generateChapter(outline, chapterNum) { ... }
```

- [ ] **Step 2: 章节润色**

```javascript
async function polishChapter(content) { ... }
```

---

## Task 4: 审核模块

- [ ] **Step 1: AI 自审**

```javascript
async function selfReview(chapter) { ... }
```

- [ ] **Step 2: 伏笔检测**

```javascript
async function checkForeshadowing(novel) { ... }
```

- [ ] **Step 3: humanizer 风格处理**

```javascript
async function humanize(content) { ... }
```

---

## Task 5: 人类把关模块

- [ ] **Step 1: 分段提交**

- [ ] **Step 2: 修改反馈处理**

- [ ] **Step 3: 版本管理**

---

## Task 6: 导出与测试

- [ ] **Step 1: 多格式导出**

- [ ] **Step 2: 单元测试**

- [ ] **Step 3: 文档完善**
