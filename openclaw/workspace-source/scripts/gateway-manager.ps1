# Gateway 进程管理脚本
# 解决：1. Gateway 不稳定导致旧进程残留 2. CLI 与 Gateway 连接超时

param(
    [string]$Action = "status"
)

$GatewayPort = 18789
$MaxRetries = 3
$RetryDelayMs = 2000

function Get-GatewayProcess {
    $process = Get-NetTCPConnection -LocalPort $GatewayPort -ErrorAction SilentlyContinue | 
        Select-Object -ExpandProperty OwningProcess -First 1
    if ($process) {
        return Get-Process -Id $process -ErrorAction SilentlyContinue
    }
    return $null
}

function Test-GatewayHealthy {
    $conn = Get-NetTCPConnection -LocalPort $GatewayPort -State Listen -ErrorAction SilentlyContinue
    return ($null -ne $conn)
}

function Start-GatewaySafely {
    Write-Host "[Gateway Manager] Starting Gateway..."
    
    # 检查是否已有进程
    $existing = Get-GatewayProcess
    if ($existing) {
        Write-Host "[Gateway Manager] Gateway already running (PID: $($existing.Id))"
        return $true
    }
    
    # 启动 Gateway
    npx openclaw gateway start 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    
    # 验证启动
    $retries = 0
    while ($retries -lt $MaxRetries) {
        if (Test-GatewayHealthy) {
            Write-Host "[Gateway Manager] Gateway started successfully"
            return $true
        }
        Start-Sleep -Milliseconds $RetryDelayMs
        $retries++
    }
    
    Write-Host "[Gateway Manager] Gateway failed to start" -ForegroundColor Red
    return $false
}

function Stop-GatewaySafely {
    Write-Host "[Gateway Manager] Stopping Gateway..."
    
    $existing = Get-GatewayProcess
    if ($existing) {
        Stop-Process -Id $existing.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "[Gateway Manager] Gateway stopped"
    } else {
        Write-Host "[Gateway Manager] No Gateway process found"
    }
}

function Restart-GatewaySafely {
    Write-Host "[Gateway Manager] Restarting Gateway..."
    Stop-GatewaySafely
    Start-Sleep -Seconds 2
    Start-GatewaySafely
}

# 执行操作
switch ($Action.ToLower()) {
    "start"  { Start-GatewaySafely }
    "stop"   { Stop-GatewaySafely }
    "restart" { Restart-GatewaySafely }
    "status" {
        $gateway = Get-GatewayProcess
        if ($gateway) {
            Write-Host "[Gateway Manager] Gateway is running (PID: $($gateway.Id), Memory: $([math]::Round($gateway.WorkingSet64/1MB, 2)) MB)"
        } else {
            Write-Host "[Gateway Manager] Gateway is NOT running"
        }
    }
    default {
        Write-Host "Usage: .\gateway-manager.ps1 [start|stop|restart|status]"
    }
}
