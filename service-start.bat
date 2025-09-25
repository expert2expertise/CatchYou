@echo off
echo Starting AI Monitoring Agent service...
echo.

call npm run service:start
if %ERRORLEVEL% neq 0 (
    echo Failed to start service!
    pause
    exit /b 1
)

echo.
echo Service started successfully!
echo Checking status...
echo.
call npm run service:status

pause