$body = '{"jsonrpc":"2.0","method":"tools/list","id":1}'
try {
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8081/mcp' -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 5
    $r.Content
} catch {
    Write-Host "Error: $_"
}
