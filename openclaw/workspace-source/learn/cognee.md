# Cognee 学习笔记

## 概述
- **全称**: Cognee
- **Stars**: 14,386 ⭐
- **语言**: Python
- **定位**: AI Agent 记忆知识引擎 (Knowledge Engine for AI Agent Memory)

## 核心理念
> Use our knowledge engine to build personalized and dynamic memory for AI Agents.
> 
> It combines vector search, graph databases and cognitive science approaches to make your documents both searchable by meaning and connected by relationships as they change and evolve.

**6 行代码构建知识图谱！**

## 核心功能

### 1. 知识基础设施
- 统一数据摄入（支持任意格式/结构）
- 向量搜索 + 图数据库
- 本地运行
- 本体锚定 (ontology grounding)
- 多模态支持

### 2. 持久学习 Agent
- 从反馈中学习
- 上下文管理
- 跨 Agent 知识共享

### 3. 可靠可信赖的 Agent
- 用户/租户隔离
- 可追溯性
- OTEL 收集器
- 审计特性

## 快速开始

### 安装
```bash
uv pip install cognee
```

### 配置 LLM
```python
import os
os.environ["LLM_API_KEY"] = "YOUR OPENAI_API_KEY"
```

### 最小示例 (6 行代码)
```python
import cognee
import asyncio

async def main():
    # 添加文档
    await cognee.add("Cognee turns documents into AI memory.")
    
    # 构建知识引擎
    await cognee.cognify()
    
    # 搜索
    results = await cognee.search("What does Cognee do?")
    
asyncio.run(main())
```

## 工作原理

1. **Ingest (摄入)**: 从各种来源加载文档
2. **Process (处理)**: 提取实体、关系、构建图结构
3. **Store (存储)**: 同时存入向量数据库 + 图数据库
4. **Query (查询)**: 语义搜索 + 图遍历组合

## 支持的 LLM Provider
- OpenAI
- Anthropic
- Google
- Azure OpenAI
- Ollama (本地)
- 等等

## 技术栈
- Python 3.10-3.13
- 向量数据库 (多种后端)
- 图数据库 (多种后端)
- LLM 集成

## 应用场景
- AI Agent 长期记忆
- 知识管理系统
- 文档语义搜索
- RAG (检索增强生成)
- 企业知识图谱

## 优缺点
**优点：**
- 简单易用，API 友好
- 兼顾向量搜索和图关系
- 本地部署可选
- 活跃社区 (14k+ stars)

**缺点：**
- Python only
- 生产环境可能需要额外配置
- 依赖外部 LLM

## 与现有系统集成可能
- 可作为 Agent 记忆层
- 可增强 RAG 系统
- 可构建知识图谱
