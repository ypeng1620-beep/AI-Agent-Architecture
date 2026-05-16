# Context Bank - Design Specification

## 1. 项目概述

**项目名称**: context-bank  
**类型**: Agent 上下文管理工具  
**核心理念**: 轻量级、无依赖、文件存储的 Agent 上下文持久化方案

**解决的问题**: 
- Agent 每次会话都是全新上下文，无法继承历史
- 复杂记忆系统（如 Mem0、langchain memory）依赖多、部署重
- 需要简单方式保存和加载对话上下文

## 2. 功能设计

### 核心功能

1. **上下文保存** - 将对话历史压缩保存到 JSON 文件
2. **上下文加载** - 从文件恢复对话历史
3. **自动摘要** - 使用简单规则压缩长上下文（保留关键信息）
4. **上下文模板** - 支持预设模板快速加载
5. **多会话管理** - 支持多个独立会话的上下文

### 数据结构

```javascript
// context-bank.json
{
  "sessions": {
    "session-uuid": {
      "createdAt": "ISO timestamp",
      "messages": [
        { "role": "user", "content": "...", "timestamp": "..." },
        { "role": "assistant", "content": "...", "timestamp": "..." }
      ],
      "metadata": {
        "name": "会话名称",
        "tags": ["标签"]
      }
    }
  },
  "activeSession": "session-uuid"
}
```

### API 设计

| 方法 | 功能 |
|------|------|
| `create(name)` | 创建新会话 |
| `addMessage(role, content)` | 添加消息 |
| `getMessages(limit)` | 获取最近N条消息 |
| `compress(ratio)` | 压缩上下文 |
| `save()` | 保存到文件 |
| `load(sessionId)` | 加载会话 |
| `list()` | 列出所有会话 |

## 3. 技术方案

- **语言**: Node.js (ESM + CommonJS 兼容)
- **存储**: 本地 JSON 文件
- **压缩算法**: 简单规则 - 保留系统提示、压缩重复内容、保留关键用户/助手消息
- **无外部依赖**: 纯原生 Node.js

## 4. 验收标准

- [ ] 可创建/加载/保存会话
- [ ] 消息添加功能正常
- [ ] 上下文压缩功能可用
- [ ] 单元测试通过
- [ ] 示例代码可运行
- [ ] 可发布到 npm
