@echo off
echo Installing AI Monitoring Agent as Windows Service...
echo.

REM Install the service using the standalone runtime
echo Installing service...
call npm run service:install
if %ERRORLEVEL% neq 0 (
    echo Service installation failed!
    pause
    exit /b 1
)

echo.
echo AI Monitoring Agent service installed successfully!
echo.
echo You can now:
echo - Start the service: service-start.bat
echo - Check status: service-status.bat
echo - Stop the service: service-stop.bat
echo - Uninstall: uninstall-service.bat
echo.

pause
