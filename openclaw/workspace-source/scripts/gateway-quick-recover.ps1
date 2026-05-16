# Quick Gateway Recovery Script
# Run by Windows Task Scheduler

$port = 18789
$logDir = "D:\OpenClaw\断连日志"
$logFile = Join-Path $logDir "quick-recover.log"

if (-not (Test-Path $logDir)) { 
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null 
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

$test = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($test) {
    "$timestamp Gateway OK" | Add-Content -Path $logFile -Encoding UTF8
    exit 0
}

"$timestamp Gateway DOWN, restarting..." | Add-Content -Path $logFile -Encoding UTF8

try {
    Start-Process -FilePath "openclaw" -ArgumentList "gateway", "restart" -NoNewWindow -Wait
    Start-Sleep -Seconds 5
    
    $test2 = Test-NetConnection -ComputerName 127.0.0.1 -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
    
    if ($test2) {
        "$timestamp Restart SUCCESS" | Add-Content -Path $logFile -Encoding UTF8
    } else {
        "$timestamp Restart FAILED" | Add-Content -Path $logFile -Encoding UTF8
    }
} catch {
    "$timestamp Restart ERROR: $_" | Add-Content -Path $logFile -Encoding UTF8
}
