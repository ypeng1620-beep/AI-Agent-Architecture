# Test OpenSpace MCP server
$tcpClient = New-Object System.Net.Sockets.TcpClient
try {
    $asyncResult = $tcpClient.BeginConnect("127.0.0.1", 8081, $null, $null)
    $wait = $asyncResult.AsyncWaitHandle.WaitOne(3000)
    if ($wait) {
        $tcpClient.EndConnect($asyncResult)
        Write-Host "Connected successfully"
        Write-Host "Local endpoint: $($tcpClient.Client.LocalEndPoint)"
        Write-Host "Remote endpoint: $($tcpClient.Client.RemoteEndPoint)"
    } else {
        Write-Host "Connection timed out"
    }
} catch {
    Write-Host "Connection error: $_"
} finally {
    $tcpClient.Close()
}
