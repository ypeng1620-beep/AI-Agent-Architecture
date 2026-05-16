# Gateway 断连监测与自动恢复 - 实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 监测 OpenClaw Gateway 服务状态，断连时自动恢复并记录日志

**Architecture:** 通过 cron job 定期执行 PowerShell 脚本检测服务状态，异常时触发恢复并写入日志

**Tech Stack:** PowerShell, OpenClaw CLI, Cron Job

---

## 文件结构

```
D:\OpenClaw\断连日志\                    # 日志目录
  └── gateway-monitor-YYYY-MM-DD.log    # 日志文件

C:\Users\ypeng\.openclaw\workspace\scripts\  # 脚本目录
  └── gateway-monitor.ps1               # 监测脚本
```

---

## Chunk 1: 创建日志目录和监测脚本

### Task 1: 创建日志目录

- [ ] **Step 1: 创建 D:\OpenClaw\断连日志\ 目录**

```powershell
New-Item -ItemType Directory -Force -Path "D:\OpenClaw\断连日志"
```

### Task 2: 编写监测脚本 gateway-monitor.ps1

- [ ] **Step 1: 创建脚本文件**

```powershell
# File: scripts/gateway-monitor.ps1
# Description: OpenClaw Gateway 断连监测与自动恢复脚本

param(
    [int]$MaxRetries = 2,
    [int]$RetryDelaySeconds = 30,
    [string]$LogBasePath = "D:\OpenClaw\断连日志"
)

$ErrorActionPreference = "Continue"

# 初始化日志路径
$date = Get-Date -Format "yyyy-MM-dd"
$logFile = Join-Path $LogBasePath "gateway-monitor-$date.log"

# 确保日志目录存在
if (-not (Test-Path $LogBasePath)) {
    New-Item -ItemType Directory -Force -Path $LogBasePath | Out-Null
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] $Message"
    Add-Content -Path $logFile -Value $logEntry -Encoding UTF8
    Write-Host $logEntry
}

function Get-GatewayStatus {
    try {
        $status = & openclaw gateway status 2>&1
        if ($status -match "running|Running") {
            return "running"
        } elseif ($status -match "stopped|Stopped|stop") {
            return "stopped"
        } else {
            return "unknown"
        }
    } catch {
        return "error"
    }
}

function Restart-Gateway {
    try {
        & openclaw gateway restart
        Start-Sleep -Seconds 5
        $newStatus = Get-GatewayStatus
        return $newStatus -eq "running"
    } catch {
        return $false
    }
}

# 主逻辑
Write-Log "====== Gateway 断连检测 ======"
$status = Get-GatewayStatus
Write-Log "[检测结果] 状态: $status"

if ($status -eq "running") {
    Write-Log "[状态] 服务正常运行"
    exit 0
}

# 服务异常，尝试恢复
Write-Log "[修复尝试] 开始尝试恢复..."

for ($i = 1; $i -le $MaxRetries; $i++) {
    Write-Log "[修复尝试] 第$i 次 - 开始..."
    
    $success = Restart-Gateway
    
    if ($success) {
        Write-Log "[修复结果] 第$i 次 - 成功"
        Write-Log "[最终状态] 已恢复"
        Write-Log "==================================="
        exit 0
    } else {
        Write-Log "[修复结果] 第$i 次 - 失败"
        if ($i -lt $MaxRetries) {
            Write-Log "[等待] 等待 ${RetryDelaySeconds}秒后重试..."
            Start-Sleep -Seconds $RetryDelaySeconds
        }
    }
}

Write-Log "[最终状态] 未恢复 - 请人工检查"
Write-Log "==================================="
exit 1
```

- [ ] **Step 2: 保存脚本到 scripts/gateway-monitor.ps1**

---

## Chunk 2: 配置 Cron Job

### Task 3: 配置定时任务

- [ ] **Step 1: 添加 cron job**

使用 cron 工具添加定时任务，检测间隔设为 2 分钟：

```json
{
  "name": "gateway-monitor",
  "schedule": { "kind": "every", "everyMs": 120000 },
  "payload": {
    "kind": "agentTurn",
    "message": "执行 PowerShell 脚本: & 'C:\\Users\\ypeng\\.openclaw\\workspace\\scripts\\gateway-monitor.ps1'"
  },
  "delivery": { "mode": "none" },
  "sessionTarget": "isolated"
}
```

- [ ] **Step 2: 验证 cron job 状态**

```bash
cron action=list
```

---

## Chunk 3: 测试验证

### Task 4: 手动测试脚本

- [ ] **Step 1: 执行脚本测试**

```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\ypeng\.openclaw\workspace\scripts\gateway-monitor.ps1"
```

预期输出：
- 服务正常运行 → "[状态] 服务正常运行"
- 服务停止 → "[修复尝试] 第1次 - 开始..." → 尝试恢复

- [ ] **Step 2: 检查日志文件**

```powershell
Get-Content "D:\OpenClaw\断连日志\gateway-monitor-2026-03-20.log"
```

---

## 实施检查清单

- [ ] Task 1: 日志目录已创建
- [ ] Task 2: 监测脚本已创建并保存
- [ ] Task 3: Cron job 已配置
- [ ] Task 4: 手动测试通过
