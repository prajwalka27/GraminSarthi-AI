@echo off
title GraminSarthi AI Launcher
color 0A
echo ================================================================
echo               GRAMINSARTHI AI - FULL STACK LAUNCHER
echo      Rural FinTech, Digital Khata, and Village Marketplace
echo ================================================================
echo.

echo [1/3] Starting GraminSarthi Backend Server on port 5000...
start "GraminSarthi Backend (Port 5000)" cmd /k "cd /d "%~dp0BACKEND" && npm run dev"

echo [2/3] Waiting for Backend initialization...
timeout /t 3 /nobreak >nul

echo [3/3] Starting GraminSarthi Frontend Website on port 3000...
start "GraminSarthi Frontend (Port 3000)" cmd /k "cd /d "%~dp0FRONTEND" && npm run dev"

echo.
echo Launching GraminSarthi AI Website in your default browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ================================================================
echo GraminSarthi AI is now active and running!
echo.
echo   * Frontend Web App:  http://localhost:3000
echo   * Backend API:       http://localhost:5000
echo   * API Health Check:  http://localhost:5000/api/health
echo   * Database Status:   http://localhost:5000/api/health/db
echo.
echo Leave the two open terminal windows running.
echo To stop the servers, close those terminal windows.
echo ================================================================
echo.
pause
