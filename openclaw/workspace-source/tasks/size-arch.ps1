$folders = @('hermes-agent', 'claude-code', 'openclaw')
$base = 'D:\AI-Agent-Architecture'
foreach ($f in $folders) {
    $path = Join-Path $base $f
    if (Test-Path $path) {
        $items = Get-ChildItem $path -File -Recurse -EA SilentlyContinue | Measure-Object -Property Length -Sum
        $files = $items.Count
        $sizeMB = [math]::Round($items.Sum / 1MB, 1)
        Write-Host "$f : $files files, $sizeMB MB"
    }
}
