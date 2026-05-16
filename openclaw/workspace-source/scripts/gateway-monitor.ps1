$port = 18789
$logDir = "D:\OpenClaw\断连日志"
$logFile = Join-Path $logDir "gateway-monitor-$(Get-Date -Format 'yyyy-MM-dd').log"

if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }

$header = "========================================"
Add-Content -Path $logFile -Value $header
Add-Content -Path $logFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') Gateway Monitor"

$test = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($test) {
    Add-Content -Path $logFile -Value "Port $port OPEN - Service OK"
    Add-Content -Path $logFile -Value $header
    exit 0
}

Add-Content -Path $logFile -Value "Port $port CLOSED - Service down"
Add-Content -Path $logFile -Value "Attempting restart..."

openclaw gateway restart
Start-Sleep -Seconds 8

$test2 = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($test2) {
    Add-Content -Path $logFile -Value "Recovery SUCCESS"
    Add-Content -Path $logFile -Value $header
    exit 0
}

Add-Content -Path $logFile -Value "Recovery FAILED"
Add-Content -Path $logFile -Value $header
exit 1
