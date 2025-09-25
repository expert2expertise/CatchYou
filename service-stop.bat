@echo off
echo Stopping AI Monitoring Agent service...
echo.

call npm run service:stop
if %ERRORLEVEL% neq 0 (
    echo Failed to stop service!
    pause
    exit /b 1
)

echo.
echo Service stopped successfully!
echo.
call npm run service:status

pause