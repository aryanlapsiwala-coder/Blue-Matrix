@echo off
title KnowPass Campus Knowledge System
echo ========================================================
echo    Starting KnowPass Campus Knowledge System...
echo ========================================================
echo.
cd /d "%~dp0"

echo [1/2] Checking dependencies...
if not exist "node_modules\vite\" (
    echo Installing node_modules (first-time setup, please wait)...
    call npm install
)

echo.
echo [2/2] Starting local Vite server on http://localhost:3000/ ...
echo (Please keep this window open while using KnowPass)
echo.

if exist "node_modules\.bin\vite.cmd" (
    call "node_modules\.bin\vite.cmd" --host --port 3000 --open
) else (
    call npm run dev -- --host --port 3000 --open
)

pause
