@echo off
title KnowPass Full-Stack Launcher (Frontend + AI Backend)
echo ========================================================
echo       Starting KnowPass Campus Knowledge System
echo           (Frontend UI + KnowBot AI Backend)
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/3] Starting KnowBot AI Backend on Port 5000...
start "KnowBot Backend (Port 5000)" cmd /k "cd /d %~dp0server && npm start"

echo [2/3] Waiting for Backend to initialize...
timeout /t 2 /nobreak >nul

echo [3/3] Starting Frontend Website on Port 3000...
echo Opening browser at http://localhost:3000 ...
echo.

if exist "node_modules\.bin\vite.cmd" (
    call "node_modules\.bin\vite.cmd" --host --port 3000 --open
) else (
    call npm run dev -- --host --port 3000 --open
)

pause
