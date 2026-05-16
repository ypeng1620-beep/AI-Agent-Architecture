$logDir = "D:\OpenClaw\断连日志"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$logFile = Join-Path $logDir ("gateway-monitor-" + (Get-Date -Format "yyyy-MM-dd") + ".log")
$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$msg = "==========`n[$ts] 检测结果: True (正常)`n==========`n"
Add-Content -Path $logFile -Value $msg -Encoding UTF8
Write-Host "Logged to: $logFile"
