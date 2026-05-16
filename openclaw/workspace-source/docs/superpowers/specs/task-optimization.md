# 定时任务优化方案

## 问题场景与解决方案

### 1. Gateway Monitor 阻塞
**问题**: systemEvent 模式阻塞 80 秒
**推荐技能组合**:
- python-background-jobs - 异步化无阻塞
- cloudflare-queues - 队列管理

**解决方案**:
- 不使用 Cron Job 的 systemEvent
- 使用外部 PowerShell 脚本 + Windows 计划任务

### 2. 定时任务占用资源
**问题**: agentTurn 任务占用大量资源
**推荐技能组合**:
- asyncio - 异步任务管理
- Task Queue - 队列限流

**解决方案**:
- 减少定时任务数量
- 手动触发信息汇总任务

### 3. 超时任务无兜底
**问题**: 任务失败无重试机制
**推荐技能组合**:
- error-recovery - 失败自动重试
- Failed Task Recovery - 补偿机制

## 当前配置
- Cron Jobs: 仅保留 1 个（承财开盘前检查）
- Gateway 监测: 外部脚本

## 未来优化方向
- 安装 python-background-jobs 技能实现异步任务
- 配置任务队列管理
