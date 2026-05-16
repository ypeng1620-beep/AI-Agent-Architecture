# Context Bank - Implementation Plan

> **For agentic workers:** Use subagent-driven-development to implement task-by-task.

**Goal**: 创建轻量级 Agent 上下文管理工具

**Architecture**: 纯 Node.js，无外部依赖，JSON 文件存储

**Tech Stack**: Node.js, ESM

---

## Task 1: 项目结构搭建

**Files:**
- Create: `context-bank/package.json`
- Create: `context-bank/index.js`
- Create: `context-bank/README.md`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "context-bank",
  "version": "1.0.0",
  "description": "Lightweight context storage for AI agents",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "node test.js"
  },
  "keywords": ["ai", "agent", "context", "memory", "claude", "openai"],
  "license": "MIT"
}
```

- [ ] **Step 2: 创建 index.js 基础结构**

```javascript
// 基础导出
export const ContextBank = class { ... };
export function createBank(options) { ... }
```

- [ ] **Step 3: 验证文件创建**

---

## Task 2: 核心 API 实现

**Files:**
- Modify: `context-bank/index.js`

- [ ] **Step 1: 实现 create() - 创建会话**

```javascript
create(name = 'default') {
  const id = generateId();
  this.sessions[id] = {
    id,
    name,
    createdAt: new Date().toISOString(),
    messages: [],
    metadata: {}
  };
  return id;
}
```

- [ ] **Step 2: 实现 addMessage() - 添加消息**

```javascript
addMessage(sessionId, role, content) {
  const session = this.sessions[sessionId];
  session.messages.push({
    role,  // 'user' | 'assistant' | 'system'
    content,
    timestamp: new Date().toISOString()
  });
}
```

- [ ] **Step 3: 实现 getMessages() - 获取消息**

```javascript
getMessages(sessionId, limit = 10) {
  const session = this.sessions[sessionId];
  return session.messages.slice(-limit);
}
```

- [ ] **Step 4: 测试核心功能**

---

## Task 3: 高级功能

**Files:**
- Modify: `context-bank/index.js`

- [ ] **Step 1: 实现 compress() - 上下文压缩**

```javascript
compress(sessionId, targetRatio = 0.5) {
  // 简单压缩：保留 system + 最新的 50% 消息
}
```

- [ ] **Step 2: 实现 save/load - 文件持久化**

```javascript
save(filepath = './context-bank.json') { ... }
load(filepath) { ... }
```

- [ ] **Step 3: 实现 list() - 会话列表**

---

## Task 4: 测试与发布准备

**Files:**
- Create: `context-bank/test.js`
- Create: `context-bank/example.js`

- [ ] **Step 1: 编写单元测试**

- [ ] **Step 2: 编写使用示例**

- [ ] **Step 3: 运行测试确认通过**

- [ ] **Step 4: 准备 GitHub 发布**
