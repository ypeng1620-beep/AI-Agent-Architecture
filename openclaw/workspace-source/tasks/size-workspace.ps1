$base = 'C:\Users\ypeng\.openclaw\workspace'
$folders = Get-ChildItem $base -Directory -EA SilentlyContinue | Where-Object { $_.Name -ne 'logs' -and $_.Name -ne 'completions' -and $_.Name -ne 'cache' -and $_.Name -ne 'canvas' }
foreach ($f in $folders) {
    $items = Get-ChildItem $f.FullName -File -Recurse -EA SilentlyContinue | Measure-Object -Property Length -Sum
    if ($items.Count -gt 0) {
        $sizeMB = [math]::Round($items.Sum / 1MB, 1)
        Write-Host "$($f.Name) : $($items.Count) files, $sizeMB MB"
    }
}
