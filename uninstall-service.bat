@echo off
echo Uninstalling AI Monitoring Agent service...
echo.

call npm run service:uninstall
if %ERRORLEVEL% neq 0 (
    echo Failed to uninstall service!
    pause
    exit /b 1
)

echo.
echo Service uninstalled successfully!
echo.
pause