# Source paths
$hermesZip = "D:\hermes-agent-main.zip"
$claudeSrc = "D:\Claude-Code-Src"
$openclawSrc = "C:\Users\ypeng\AppData\Roaming\npm\node_modules\openclaw"
$dest = "D:\AI-Agent-Architecture"

# Check hermes zip
if (Test-Path $hermesZip) {
    $size = [math]::Round((Get-Item $hermesZip).Length / 1MB, 1)
    Write-Host "Hermes zip: $size MB"
} else {
    Write-Host "Hermes zip not found at $hermesZip"
}

# Check Claude Code src
if (Test-Path $claudeSrc) {
    $files = (Get-ChildItem $claudeSrc -Recurse -File -EA SilentlyContinue | Measure-Object).Count
    $size = [math]::Round((Get-ChildItem $claudeSrc -Recurse -File -EA SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    Write-Host "Claude Code: $files files, $size MB"
} else {
    Write-Host "Claude Code src not found"
}

# Check OpenClaw npm package
if (Test-Path $openclawSrc) {
    $files = (Get-ChildItem $openclawSrc -Recurse -File -EA SilentlyContinue | Measure-Object).Count
    $size = [math]::Round((Get-ChildItem $openclawSrc -Recurse -File -EA SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 1)
    Write-Host "OpenClaw npm: $files files, $size MB"
} else {
    Write-Host "OpenClaw npm not found at $openclawSrc"
}
