@echo off
echo ========================================
echo Radiance Invoice System - Server Startup
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and configure it.
    echo.
    pause
    exit /b 1
)

echo Starting server and opening browser...
echo.
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server.
echo.

start http://localhost:3000
npm start
