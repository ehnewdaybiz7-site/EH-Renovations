@echo off
title Launch EH Renovations Curation Tool
echo ===================================================
echo     EH Renovations Curation Tool Launcher
echo ===================================================
echo.

:: Check if port 8000 is already in use
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo [INFO] Local web server is already running on port 8000.
) else (
    echo [1/2] Starting local web server in the background...
    :: Launch powershell script in hidden window
    start /b powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "%~dp0start-server.ps1"
    :: Give the server 2 seconds to initialize
    timeout /t 2 /nobreak >nul
)

echo [2/2] Opening Curation Dashboard in browser...
start http://localhost:8000/curator.html

echo.
echo ===================================================
echo [SUCCESS] Curation Tool has been launched!
echo.
echo NOTE: Accessing the tool at http://localhost:8000/
echo allows Chrome to remember your microphone permissions
echo permanently.
echo ===================================================
echo.
timeout /t 5 >nul
