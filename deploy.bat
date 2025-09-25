@echo off
echo ===================================
echo AI Monitoring Agent - Deployment
echo ===================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Not running as administrator
    echo Some features may not work properly
    echo.
)

echo Checking system requirements...
powershell -Command "Get-ExecutionPolicy" >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PowerShell execution policy is too restrictive
    echo Please run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    pause
    exit /b 1
)

echo System requirements check passed!
echo.

echo Testing the AI Monitoring Agent...
node standalone-agent.js test

echo.
echo ===================================
echo Deployment Complete!
echo ===================================
echo.
echo To start the agent:
echo   node standalone-agent.js start
echo.
echo To run a test:
echo   node standalone-agent.js test
echo.
echo To check status:
echo   node standalone-agent.js status
echo.

pause
