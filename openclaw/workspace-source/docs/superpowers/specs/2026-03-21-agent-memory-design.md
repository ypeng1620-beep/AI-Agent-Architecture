# Agent Context Memory Service - Design

## 1. 项目概述

**目标**: 为 OpenClaw Agent 做一个轻量级的跨会话上下文记忆服务，让 Agent 记住重要信息供后续会话使用。

**解决的问题**: 当前 OpenClaw 每次会话都是全新的，无法记住之前的上下文。MEMORY.md 手动维护太繁琐。

## 2. 功能设计

### 核心功能

1. **自动记忆** - Agent 可自动将重要信息写入记忆
2. **智能检索** - 基于关键词和语义搜索记忆
3. **自动提醒** - 相关记忆在对话中自动浮现
4. **记忆标签** - 支持分类标签便于管理

### 数据结构

```json
{
  "id": "uuid",
  "content": "记忆内容",
  "tags": ["标签1", "标签2"],
  "importance": 1-5,
  "createdAt": "timestamp",
  "sessionId": "会话ID",
  "relatedTo": ["相关记忆ID"]
}
```

### API 设计

- `memory.add(content, tags, importance)` - 添加记忆
- `memory.search(query, limit)` - 搜索记忆
- `memory.get(id)` - 获取单条记忆
- `memory.list(tags, limit)` - 按标签列出记忆
- `memory.delete(id)` - 删除记忆
- `memory.autoremind(context)` - 根据上下文自动提醒

## 3. 技术方案

- **存储**: JSON 文件 (轻量级，无需数据库)
- **索引**: 内存索引 + 文件持久化
- **搜索**: 关键词匹配 + 简单语义
- **格式**: Node.js 模块，易于集成

## 4. 边界与限制

- 仅处理文本记忆
- 单文件存储，最大 10MB
- 简单部署，无需额外服务

## 5. 验收标准

- [ ] 可添加/查询/删除记忆
- [ ] 支持标签分类
- [ ] 搜索功能可用
- [ ] 单元测试通过
- [ ] 示例代码可运行
