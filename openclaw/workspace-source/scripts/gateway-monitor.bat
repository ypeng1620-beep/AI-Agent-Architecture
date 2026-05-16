@echo off
set LOG_DIR=D:\OpenClaw\断连日志
set PORT=18789

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

for /f "tokens=1-3 delims=/ " %%a in ('date /t') do (
    set LOG_FILE=%LOG_DIR%\gateway-monitor-%%c-%%a-%%b.log
)

echo ======================================== >> "%LOG_FILE%"
echo [%date% %time%] ====== Gateway Monitor ====== >> "%LOG_FILE%"

powershell -Command "Test-NetConnection -ComputerName 127.0.0.1 -Port %PORT% -InformationLevel Quiet" >nul 2>&1
if %errorlevel%==0 (
    echo [%date% %time%] Port OPEN - Service OK >> "%LOG_FILE%"
    echo [%date% %time%] ======================================= >> "%LOG_FILE%"
    exit /b 0
)

echo [%date% %time%] Port CLOSED - Service down >> "%LOG_FILE%"
echo [%date% %time%] Attempting restart... >> "%LOG_FILE%"

openclaw gateway restart
timeout /t 8 /nobreak >nul

powershell -Command "Test-NetConnection -ComputerName 127.0.0.1 -Port %PORT% -InformationLevel Quiet" >nul 2>&1
if %errorlevel%==0 (
    echo [%date% %time%] Recovery SUCCESS >> "%LOG_FILE%"
    echo [%date% %time%] ======================================= >> "%LOG_FILE%"
    exit /b 0
)

echo [%date% %time%] Recovery FAILED >> "%LOG_FILE%"
echo [%date% %time%] ======================================= >> "%LOG_FILE%"
exit /b 1
