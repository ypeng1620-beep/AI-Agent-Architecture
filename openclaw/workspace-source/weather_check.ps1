[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ProgressPreference = 'SilentlyContinue'
try {
    $r = Invoke-RestMethod -Uri 'https://wttr.in/Guiyang?format=j1' -UserAgent 'Mozilla/5.0'
    $c = $r.current_condition[0]
    
    Write-Host "=== CURRENT ==="
    Write-Host ("Weather: " + $c.weatherDesc[0].value)
    Write-Host ("Temp: " + $c.temp_C[0] + " C")
    Write-Host ("FeelsLike: " + $c.FeelsLikeC[0] + " C")
    Write-Host ("Humidity: " + $c.humidity[0] + "%")
    Write-Host ("Wind: " + $c.windspeedKmph[0] + " km/h")
    Write-Host ("Precip: " + $c.precipMM[0] + " mm")
    
    Write-Host ""
    Write-Host "=== WEATHER OBJECT ==="
    $r.weather | ForEach-Object {
        Write-Host ("Desc: " + $_.desc)
        Write-Host ("MaxTemp: " + $_.maxTempC)
        Write-Host ("MinTemp: " + $_.minTempC)
        Write-Host ("Rain: " + $_.precipMM)
        Write-Host ("UV: " + $_.uvIndex)
    }
} catch {
    Write-Host "ERROR: $_"
}
