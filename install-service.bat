@echo off
echo Installing AI Monitoring Agent as Windows Service...
echo.

REM Build the project first
echo Building project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

REM Install the service
echo Installing service...
call npm run service:install -- --enable-watchdog
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