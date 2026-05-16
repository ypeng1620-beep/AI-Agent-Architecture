# SpacetimeDB 学习笔记

## 概述
- **全称**: SpacetimeDB
- **Stars**: 23,873 ⭐
- **语言**: Rust
- **定位**: 关系型数据库 + 服务器 = 数据库即服务

## 核心理念
> Write your schema and business logic as a module. SpacetimeDB compiles it, runs it inside the database, and automatically synchronizes state to connected clients in real-time.

**特点：**
- 无服务器架构：客户端直连数据库，无需中间服务器
- 单一二进制部署：整个应用作为一个模块部署
- 实时同步：数据变更自动推送到订阅的客户端
- 内存优先：所有状态保存在内存中，磁盘日志保证持久性

## 核心概念

### 1. Tables (表)
定义数据结构，类似传统数据库表：
```rust
#[spacetimedb::table(accessor = messages, public)]
pub struct Message {
    #[primary_key]
    #[auto_inc]
    id: u64,
    sender: Identity,
    text: String,
}
```

### 2. Reducers (归约器)
业务逻辑，类似 API 端点：
```rust
#[spacetimedb::reducer]
pub fn send_message(ctx: &ReducerContext, text: String) {
    ctx.db.messages().insert(Message {
        id: 0,
        sender: ctx.sender,
        text,
    });
}
```

### 3. 客户端订阅
```typescript
const [messages] = useTable(tables.message);
// 自动接收实时更新，无需轮询
```

## 支持语言
- Rust (官方)
- C# (.NET)
- TypeScript/JavaScript
- C++

## 安装
```bash
# macOS / Linux
curl -sSf https://install.spacetimedb.com | sh

# Windows (PowerShell)
iwr https://windows.spacetimedb.com -useb | iex
```

## 应用场景
- 实时多人游戏 (MMORPG)
- 协作应用
- 聊天应用
- 实时数据同步需求的应用

## 对比传统架构
| 传统架构 | SpacetimeDB |
|----------|-------------|
| Web服务器 + 数据库 + 缓存 | 单一数据库模块 |
| 手动同步状态 | 自动实时推送 |
| 需要 DevOps/K8s | 零基础设施管理 |

## 优缺点
**优点：**
- 极低延迟
- 简化部署
- 实时同步开箱即用

**缺点：**
- 学习曲线（需学 Rust 或其他模块语言）
- 生态系统相对年轻
- 适合实时同步场景，非通用数据库
