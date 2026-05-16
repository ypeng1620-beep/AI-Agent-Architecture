# OpenClaw 可视化面板私人版 - 详细设计文档

**版本：** 1.0  
**日期：** 2026-03-29  
**作者：** 承安  
**状态：** 设计完成，待开发

---

## 一、项目概述

### 1.1 项目定位

面向 OpenClaw 爬虫框架的**全功能可视化面板**，实现无代码/低代码的任务配置、实时监控、集群管理、知识沉淀与运行记忆回溯。

### 1.2 技术架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│                        前端 (React)                              │
│  shadcn/ui + Tailwind + ECharts + AntV G6                      │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTP + WebSocket
┌─────────────────────────────┴───────────────────────────────────┐
│                     后端 (FastAPI + SQLite)                     │
│            JWT认证 | 双通道数据获取 | 任务调度                   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ 双通道
┌─────────────────────────────┴───────────────────────────────────┐
│                   OpenClaw Gateway + 文件系统                    │
│       HTTP API + WebSocket + 文件读取（配置/日志）              │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 部署形态

- **开发模式**：本地运行（Python + Node.js）
- **未来支持**：Docker 容器化部署

---

## 二、功能模块设计

### 2.1 第一阶段：MVP

#### 2.1.1 仪表盘 (Dashboard)

**核心指标卡片：**
- 今日运行任务数
- 活跃节点数
- 总采集量
- API 调用次数（可选）

**实时图表：**
- 近 1h / 24h 采集速度（条/秒）- ECharts 折线图
- 任务状态分布环形图（成功/失败/运行中）

**资源健康度：**
- 节点平均 CPU/内存使用率 - 折线图
- 代理池可用数量及成功率

**快速入口：**
- 新建任务
- 查看告警
- 最近任务列表

#### 2.1.2 任务管理 (Task Manager)

**任务列表：**
- 表格展示：任务名称、调度类型、状态、最近运行时间、总采集量、成功率
- 操作：启动、暂停、停止、编辑、克隆、删除
- 搜索与筛选：按名称、状态、站点标签

**任务配置向导（6步进阶版）：**

```
步骤1: 基础信息
├── 任务名称
├── 任务描述
└── 调度类型 (Cron/手动)

步骤2: 目标设置
├── 起始URL列表 (支持上传文件)
├── 抓取深度
└── 页面限制

步骤3: 提取规则 (可视化配置器)
├── 点击预览元素自动生成 XPath/CSS 选择器
├── 字段映射 (标题、价格、图片等)
└── 支持嵌套 JSON 输出

步骤4: 反爬策略
├── 请求头模板
├── 代理池开关
├── 随机延迟范围
├── 重试次数
└── 验证码识别接口

步骤5: 存储设置
├── 目标数据库 (MySQL/MongoDB/本地文件)
└── 连接参数

步骤6: 高级选项
├── 并发数
├── 超时时间
└── 自定义脚本注入
```

**版本管理：**
- 记录每次配置修改历史
- 支持回滚到任意版本

**任务进度穿透：**
- 点击运行中的任务，可查看其被分配到哪些 Agent 节点
- 每个节点的完成进度（已采集页数/总页数）

#### 2.1.3 实时监控 (Real-time Monitor)

**全局控制台：**
- WebSocket 推送所有节点的实时日志（滚动显示）
- 支持按任务/节点过滤
- 高亮错误与警告

**单个任务监控：**
- 请求瀑布图（DNS、连接、下载耗时）
- 错误聚合面板：按错误类型归类，给出修复建议

**节点实时动态：**
- 实时资源仪表盘（CPU、内存、网络 IO）
- 当前正在执行的任务及进度条
- 最近 100 条请求日志
- 远程控制按钮（暂停/终止任务、重启 Agent）- 需二次确认

#### 2.1.4 节点管理 (Nodes & Proxies)

**代理池状态：**
- 列表展示代理来源、总数量、可用数量、地区分布、平均响应时间
- 图表：可用率趋势、按小时使用量
- 操作：手动添加/删除代理、测试连通性

**节点管理：**
- 卡片/表格展示所有 Agent：名称、IP、状态（在线/离线）、当前任务数、负载
- 支持动态扩缩容（未来 K8s 集成）
- 任务分配策略：轮询、按当前负载、指定节点

#### 2.1.5 用户认证

**认证方式：** JWT Token

**角色权限 (RBAC)：**
- 管理员：全部权限
- 开发者：任务管理、监控、节点管理
- 只读：仅查看

---

## 三、OpenClaw 对接设计

### 3.1 双通道数据获取

| 数据类型 | 通道A (HTTP API) | 通道B (文件系统) | 优先级 |
|----------|------------------|------------------|--------|
| Gateway状态 | GET /status | 读取进程信息 | API优先 |
| 节点列表 | GET /nodes | - | API |
| Cron任务 | cron API | config/*.yaml | API优先 |
| 会话列表 | sessions API | sessions/*.json | API优先 |
| 知识库 | API | knowledge/*.js | 文件优先 |
| 日志 | 轮询 API | logs/*.log | WebSocket优先 |

### 3.2 API 封装层设计

```python
# 后端/src/services/openclaw_client.py

class OpenClawClient:
    """OpenClaw 双通道客户端"""
    
    def __init__(self, gateway_url: str, workspace_path: str):
        self.gateway_url = gateway_url
        self.workspace_path = workspace_path
    
    # 状态获取
    async def get_gateway_status(self) -> dict:
        """获取Gateway状态"""
        # 优先API，失败则读取文件系统
        pass
    
    async def get_nodes(self) -> list:
        """获取节点列表"""
        pass
    
    # Cron任务
    async def list_cron_jobs(self) -> list:
        """列出所有定时任务"""
        pass
    
    async def create_cron_job(self, config: dict) -> dict:
        """创建定时任务"""
        pass
    
    # 会话
    async def list_sessions(self) -> list:
        """列出所有会话"""
        pass
    
    # 知识库
    async def search_knowledge(self, query: str) -> list:
        """搜索知识库"""
        pass
    
    # 日志
    def subscribe_logs(self) -> WebSocket:
        """WebSocket订阅日志"""
        pass
    
    async def poll_logs(self, since: str) -> list:
        """轮询日志"""
        pass
```

### 3.3 环境变量配置

```bash
# .env.example
OPENCLAW_GATEWAY_URL=http://127.0.0.1:18789
OPENCLAW_WORKSPACE_PATH=C:\Users\ypeng\.openclaw\workspace
DATABASE_URL=sqlite:///./openclaw_panel.db
JWT_SECRET=your-secret-key
```

---

## 四、数据库设计

### 4.1 SQLite 表结构

```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'developer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 任务配置表
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(20), -- 'cron' or 'manual'
    cron_expr VARCHAR(50),
    config JSON NOT NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft/running/paused/stopped
    version INTEGER DEFAULT 1,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 任务版本历史
CREATE TABLE task_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    config JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 知识库 - 规则模板
CREATE TABLE rule_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    domain VARCHAR(100),
    selector_type VARCHAR(20), -- xpath/css/regex
    selector_value TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 知识库 - 站点指纹
CREATE TABLE site_fingerprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain VARCHAR(100) UNIQUE NOT NULL,
    tech_stack TEXT, -- JSON
    anti_crawling_features TEXT, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 知识库 - 代理配置
CREATE TABLE proxy_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    proxy_type VARCHAR(20), -- residential/datacenter
    endpoint TEXT,
    tags TEXT, -- JSON array
    success_rate FLOAT,
    avg_response_time FLOAT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 记忆库 - 任务执行历史
CREATE TABLE task_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER REFERENCES tasks(id),
    started_at DATETIME,
    ended_at DATETIME,
    status VARCHAR(20), -- success/failed/running
    total_collected INTEGER DEFAULT 0,
    success_rate FLOAT,
    error_summary JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 审计日志
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(20),
    target_id INTEGER,
    details JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 告警规则
CREATE TABLE alert_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    threshold FLOAT NOT NULL,
    condition VARCHAR(10), -- gt/lt/eq
    notification_channels JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 ORM 模型 (SQLAlchemy)

```python
# 后端/src/models/models.py
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default='developer')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Task(Base):
    __tablename__ = 'tasks'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String)
    schedule_type = Column(String(20))
    cron_expr = Column(String(50))
    config = Column(JSON, nullable=False)
    status = Column(String(20), default='draft')
    version = Column(Integer, default=1)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    versions = relationship("TaskVersion", back_populates="task")
    executions = relationship("TaskExecution", back_populates="task")

class TaskVersion(Base):
    __tablename__ = 'task_versions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey('tasks.id'))
    version = Column(Integer, nullable=False)
    config = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey('users.id'))
    
    task = relationship("Task", back_populates="versions")

# ... 其他模型类似
```

---

## 五、API 接口设计

### 5.1 面板自身 API

#### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 登录获取JWT |
| POST | /api/auth/logout | 登出 |
| GET | /api/auth/me | 获取当前用户 |

#### 任务管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/tasks | 任务列表 |
| POST | /api/tasks | 创建任务 |
| GET | /api/tasks/{id} | 任务详情 |
| PUT | /api/tasks/{id} | 更新任务 |
| DELETE | /api/tasks/{id} | 删除任务 |
| POST | /api/tasks/{id}/start | 启动任务 |
| POST | /api/tasks/{id}/stop | 停止任务 |
| GET | /api/tasks/{id}/versions | 版本历史 |
| POST | /api/tasks/{id}/rollback | 回滚版本 |

#### 仪表盘

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/dashboard/stats | 核心指标 |
| GET | /api/dashboard/charts | 图表数据 |

#### 实时监控

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/monitor/logs | 轮询日志 |
| WS | /ws/monitor/logs | WebSocket日志 |
| GET | /api/monitor/nodes/{id} | 节点详情 |
| POST | /api/monitor/nodes/{id}/control | 节点控制 |

#### 知识库

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/knowledge/rules | 规则模板列表 |
| POST | /api/knowledge/rules | 创建规则 |
| GET | /api/knowledge/sites | 站点指纹 |
| POST | /api/knowledge/sites | 创建站点 |
| GET | /api/knowledge/proxies | 代理配置 |
| POST | /api/knowledge/proxies | 添加代理 |

#### 记忆库

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/memory/executions | 执行历史 |
| GET | /api/memory/executions/{id} | 执行详情 |

#### 系统

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |

### 5.2 OpenClaw 对接 API 封装

```python
# 后端/src/routers/openclaw.py
from fastapi import APIRouter, Depends
from ..services.openclaw_client import OpenClawClient
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/openclaw", tags=["openclaw"])

@router.get("/status")
async def get_gateway_status(current_user = Depends(get_current_user)):
    """获取Gateway状态"""
    client = get_openclaw_client()
    return await client.get_gateway_status()

@router.get("/nodes")
async def get_nodes(current_user = Depends(get_current_user)):
    """获取节点列表"""
    pass

@router.get("/cron/jobs")
async def list_cron_jobs(current_user = Depends(get_current_user)):
    """列出定时任务"""
    pass

@router.post("/cron/jobs")
async def create_cron_job(config: dict, current_user = Depends(get_current_user)):
    """创建定时任务"""
    pass

@router.get("/sessions")
async def list_sessions(current_user = Depends(get_current_user)):
    """列出会话"""
    pass

@router.get("/knowledge/search")
async def search_knowledge(q: str, current_user = Depends(get_current_user)):
    """搜索知识库"""
    pass
```

---

## 六、前端页面设计

### 6.1 页面结构

```
src/
├── components/
│   ├── ui/           # shadcn/ui 组件
│   ├── dashboard/   # 仪表盘组件
│   ├── tasks/       # 任务管理组件
│   ├── monitor/     # 监控组件
│   └── nodes/       # 节点管理组件
├── pages/
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── TaskList.tsx
│   ├── TaskWizard.tsx
│   ├── Monitor.tsx
│   ├── NodeList.tsx
│   ├── Knowledge.tsx
│   └── Memory.tsx
├── hooks/
│   ├── useOpenClaw.ts
│   ├── useWebSocket.ts
│   └── useTasks.ts
├── services/
│   ├── api.ts
│   └── openclaw.ts
└── types/
    └── index.ts
```

### 6.2 核心页面布局

#### 仪表盘
```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo | Nav | User Avatar                          │
├─────────────────────────────────────────────────────────────┤
│  Stats Cards (4列)                                          │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                  │
│  │任务数 │ │节点数 │ │采集量 │ │成功率 │                  │
│  └───────┘ └───────┘ └───────┘ └───────┘                  │
├─────────────────────────────────────────────────────────────┤
│  Charts (2列)                                               │
│  ┌─────────────────────┐ ┌─────────────────────┐          │
│  │ 采集速度折线图       │ │ 任务状态环形图       │          │
│  └─────────────────────┘ └─────────────────────┘          │
├─────────────────────────────────────────────────────────────┤
│  Recent Tasks / Quick Actions                                │
└─────────────────────────────────────────────────────────────┘
```

#### 任务配置向导
```
┌─────────────────────────────────────────────────────────────┐
│  Step Indicator: [1][2][3][4][5][6]                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Form Content (根据当前步骤渲染)                           │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Prev]                              [Next/Submit]          │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 UI 设计风格

**参考项目：**
- V0 (v0.dev) - 极简现代
- Linear - 深色专业
- Cal.com - 清新简洁

**色彩方案：**
```typescript
// tailwind.config.js
{
  colors: {
    primary: {
      50: '#f0f9ff',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
    dark: {
      bg: '#09090b',
      card: '#18181b',
      border: '#27272a',
    }
  }
}
```

---

## 七、开发任务拆解

### 阶段一：MVP (第一阶段)

| 序号 | 任务 | 预估工时 | 依赖 |
|------|------|----------|------|
| 1.1 | 项目初始化 (React + FastAPI) | 2h | - |
| 1.2 | 数据库模型 + ORM | 4h | 1.1 |
| 1.3 | JWT 认证 + 用户管理 | 4h | 1.2 |
| 1.4 | 仪表盘页面 + 图表 | 6h | 1.3 |
| 1.5 | 任务列表 CRUD | 6h | 1.2 |
| 1.6 | 任务配置向导 (6步) | 12h | 1.5 |
| 1.7 | 实时日志 (轮询 + WS) | 8h | 1.3 |
| 1.8 | 节点管理页面 | 6h | 1.7 |
| 1.9 | OpenClaw 对接封装 | 8h | 1.7 |
| 1.10 | 部署配置 + 测试 | 4h | 全部 |

**第一阶段预估总工时：60小时**

---

### 阶段二：核心增强 (第二阶段)

| 序号 | 任务 | 预估工时 |
|------|------|----------|
| 2.1 | 可视化规则提取器 | 12h |
| 2.2 | 代理池管理 | 8h |
| 2.3 | 实时监控图表 | 8h |
| 2.4 | 错误聚合面板 | 6h |
| 2.5 | ClawTeam 拓扑图 (G6) | 10h |
| 2.6 | 任务分配热力图 | 8h |
| 2.7 | 故障转移可视化 | 6h |

**第二阶段预估总工时：58小时**

---

### 阶段三：智能模块 (第三阶段)

| 序号 | 任务 | 预估工时 |
|------|------|----------|
| 3.1 | 知识库 - 规则管理 | 10h |
| 3.2 | 知识库 - 站点指纹 | 8h |
| 3.3 | 知识库 - 代理知识 | 6h |
| 3.4 | 知识库 - 智能推荐 | 10h |
| 3.5 | 记忆库 - 执行历史 | 8h |
| 3.6 | 记忆库 - 决策记忆 | 8h |
| 3.7 | 记忆库 - 故障快照 | 6h |
| 3.8 | 告警系统 | 10h |

**第三阶段预估总工时：66小时**

---

### 阶段四：高级特性 (第四阶段)

| 序号 | 任务 | 预估工时 |
|------|------|----------|
| 4.1 | 任务版本管理 | 6h |
| 4.2 | 审计日志 | 8h |
| 4.3 | 数据清洗低代码 | 12h |
| 4.4 | 动态扩缩容集成 | 10h |
| 4.5 | RBAC 权限细化 | 6h |
| 4.6 | 凭证管理 | 8h |

**第四阶段预估总工时：50小时**

---

## 八、安全设计

### 8.1 认证

- JWT Token 认证
- Token 有效期：24小时（可配置）
- 密码使用 bcrypt 哈希

### 8.2 API 安全

- 所有非公开 API 需携带有效 JWT
- CORS 配置限制来源
- 请求频率限制（可选）

### 8.3 敏感数据

- 数据库不存储明文密码
- OpenClaw 凭证加密存储（AES）
- 操作日志记录审计

---

## 九、潜在问题与解决方案

### 9.1 OpenClaw API 可用性

**问题：** 面板能否正常工作取决于 OpenClaw API  
**方案：** 
- 开发 API 兼容性检查
- 文件系统读取作为降级方案
- 预留 Mock 模式便于开发测试

### 9.2 SQLite 并发限制

**问题：** 高并发写入可能锁等待  
**方案：** 
- 使用 SQLAlchemy 抽象数据层
- 未来平滑迁移 PostgreSQL
- 写操作使用事务批量处理

### 9.3 文件系统路径

**问题：** 文件路径固定可能导致权限问题  
**方案：** 
- 通过环境变量配置路径
- 启动时检查路径可访问性
- 优先使用 API 减少文件系统依赖

---

## 十、交付清单

1. ✅ 本设计文档
2. ⏳ 数据库 ER 图
3. ⏳ API 接口文档 (OpenAPI)
4. ⏳ 前端页面原型
5. ⏳ 项目代码仓库
6. ⏳ 部署文档

---

**文档状态：** 设计完成，可进入开发阶段