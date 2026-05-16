# Gateway 断连问题解决方案

## 一、问题诊断

### 常见断连原因
| 原因 | 概率 | 表现 |
|------|------|------|
| Cron Job 配置错误导致负载过高 | 高 | 连续执行失败，服务无响应 |
| Gateway 进程崩溃 | 中 | 端口断开，需手动重启 |
| 内存/资源不足 | 中 | 进程被杀或卡死 |
| 网络异常 | 低 | 偶发断开 |

### 当前问题
- ❌ 重复的 Cron Job 导致重复执行
- ❌ Job 配置错误（delivery mode 问题）
- ❌ 缺乏自动恢复机制

---

## 二、解决方案

### 1. 清理重复/错误 Cron Job ✅ 已完成
- 删除重复的 gateway-monitor job
- 保留一个正确配置的 job

### 2. 优化 Cron Job 配置

**错误配置示例（会导致问题）：**
```json
{
  "delivery": { "mode": "announce" }  // ❌ 错误：未指定 chatId
}
```

**正确配置：**
```json
{
  "delivery": { "mode": "none" }  // ✅ 只记录日志，不发通知
}
```

### 3. 监测脚本优化

**当前脚本问题：**
- 使用 agentTurn 执行，耗时长
- 可能导致 Gateway 负载波动

**优化方案：使用 systemEvent 代替 agentTurn**

```json
{
  "name": "gateway-monitor",
  "schedule": { "kind": "every", "everyMs": 120000 },
  "payload": {
    "kind": "systemEvent",
    "text": "[Gateway Monitor] Check status and restart if needed"
  },
  "delivery": { "mode": "none" },
  "sessionTarget": "main"
}
```

### 4. 快速恢复脚本

创建独立的 PowerShell 脚本，由系统计划任务调用：

```powershell
# gateway-quick-recover.ps1
$port = 18789
$logFile = "D:\OpenClaw\断连日志\quick-recover.log"

$test = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $test) {
    "$((Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) Gateway down, restarting..." | Add-Content -Path $logFile
    Start-Process -FilePath "openclaw" -ArgumentList "gateway", "restart" -NoNewWindow
    "$((Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) Restart command sent" | Add-Content -Path $logFile
} else {
    "$((Get-Date -Format 'yyyy-MM-dd HH:mm:ss')) Gateway OK" | Add-Content -Path $logFile
}
```

### 5. 长期优化建议

| 优化项 | 方案 | 优先级 |
|--------|------|--------|
| 使用 systemEvent | 减少 agentTurn 负载 | 高 |
| 独立监测 | 用 Windows 计划任务调用脚本 | 中 |
| 资源监控 | 监测 CPU/内存使用率 | 低 |
| 日志分析 | 定期分析崩溃原因 | 中 |

---

## 三、实施清单

- [x] 1. 清理重复 Cron Job
- [ ] 2. 修改为 systemEvent 模式
- [ ] 3. 创建快速恢复脚本
- [ ] 4. 配置 Windows 计划任务备份

---

## 四、当前配置

| 项目 | 配置 |
|------|------|
| 监测间隔 | 2 分钟 |
| Cron Job | 1 个正常运行 |
| 日志位置 | D:\OpenClaw\断连日志\ |
