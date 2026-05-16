$hermesZip = "D:\hermes-agent-main.zip"
$dest = "D:\AI-Agent-Architecture"

# Hermes: copy zip directly (10.4 MB)
if (Test-Path $hermesZip) {
    Copy-Item $hermesZip "$dest\hermes-agent\hermes-agent-main.zip"
    Write-Host "Hermes: copied (10.4 MB)"
}

# Claude Code: copy src folder (29.5 MB)
$claudeSrc = "D:\Claude-Code-Src"
if (Test-Path $claudeSrc) {
    Copy-Item "$claudeSrc\src" "$dest\claude-code\src" -Recurse
    Copy-Item "$claudeSrc\README.md" "$dest\claude-code\" -ErrorAction SilentlyContinue
    Write-Host "Claude Code: copied src/ (29.5 MB)"
}

# OpenClaw workspace source only
$openclawWorkspace = "C:\Users\ypeng\.openclaw\workspace"
$destOpenclaw = "$dest\openclaw\workspace"

# Exclude large runtime dirs
$excludeDirs = @('logs', 'completions', 'cache', 'media', 'credentials', 'canvas', 'devices')

$files = Get-ChildItem $openclawWorkspace -Recurse -File -EA SilentlyContinue | Where-Object {
    $full = $_.FullName
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($full -match $dir) { $skip = $true; break }
    }
    -not $skip
}

$totalSize = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "OpenClaw workspace source: $($files.Count) files, $([math]::Round($totalSize, 1)) MB"

# Copy with progress
$count = 0
foreach ($f in $files) {
    $rel = $f.FullName.Substring($openclawWorkspace.Length)
    $destPath = $destOpenclaw + $rel
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
    Copy-Item $f.FullName $destPath -Force
    $count++
    if ($count % 500 -eq 0) { Write-Host "  Copied $count files..." }
}
Write-Host "OpenClaw: copied $count files"
