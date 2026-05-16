# Agent Context Memory Service - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task.

**Goal:** 创建一个轻量级的 Agent 上下文记忆服务，让 OpenClaw Agent 可以跨会话记住重要信息。

**Architecture:** 基于 JSON 文件的轻量级记忆存储，使用内存索引加速搜索，支持标签分类和语义检索。

**Tech Stack:** Node.js, 无外部依赖

---

## Task 1: 项目结构搭建

**Files:**
- Create: `skills/agent-memory/index.js`
- Create: `skills/agent-memory/package.json`
- Create: `skills/agent-memory/README.md`

- [ ] **Step 1: 创建目录和基础文件**

```javascript
// skills/agent-memory/index.js
const fs = require('fs');
const path = require('path');

const MEMORY_FILE = path.join(__dirname, 'memory.json');

// 初始化
if (!fs.existsSync(MEMORY_FILE)) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify({ memories: [], index: {} }, null, 2));
}
```

- [ ] **Step 2: 添加基本结构代码**

- [ ] **Step 3: 验证文件创建**

---

## Task 2: 核心 API 实现

**Files:**
- Modify: `skills/agent-memory/index.js`

- [ ] **Step 1: 实现 add() 方法**

```javascript
function add(content, tags = [], importance = 3) {
  const memory = {
    id: generateId(),
    content,
    tags,
    importance,
    createdAt: new Date().toISOString(),
    relatedTo: []
  };
  // 保存到文件
  // 更新索引
  return memory;
}
```

- [ ] **Step 2: 实现 search() 方法**

```javascript
function search(query, limit = 10) {
  // 关键词匹配
  // 返回结果
}
```

- [ ] **Step 3: 实现 list() 和 get() 方法**

- [ ] **Step 4: 运行测试验证**

---

## Task 3: 高级功能

**Files:**
- Modify: `skills/agent-memory/index.js`

- [ ] **Step 1: 实现自动提醒功能 (autoremind)**

- [ ] **Step 2: 实现标签管理**

- [ ] **Step 3: 测试高级功能**

---

## Task 4: 测试与文档

**Files:**
- Create: `skills/agent-memory/test.js`
- Create: `skills/agent-memory/README.md`

- [ ] **Step 1: 编写单元测试**

- [ ] **Step 2: 编写使用文档**

- [ ] **Step 3: 运行测试确认通过**
