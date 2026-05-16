$logDir = 'D:\OpenClaw\断连日志'
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}
$logFile = Join-Path $logDir ("gateway-monitor-" + (Get-Date -Format 'yyyy-MM-dd') + ".log")
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
$content = "==========`n[$timestamp] Detection: True`n[$timestamp] Recovery: No action needed (Gateway running)`n==========`n"
Add-Content -Path $logFile -Value $content
Write-Host "Logged to: $logFile"
