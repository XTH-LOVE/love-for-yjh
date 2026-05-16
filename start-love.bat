@echo off
chcp 65001 >nul
title Love For YJH - Forever Love Yang Jinghuan

echo ===================================================
echo   Love For YJH
echo   http://127.0.0.1:8080
echo   http://172.23.11.91:8080 (LAN)
echo ===================================================
echo.

:: Start backend server
cd /d "D:\love-for-yjh\backend"
echo [1/2] Starting backend server on port 8080...
start "Love-Server" /min "C:\Program Files\nodejs\node.exe" src/server.js
timeout /t 5 /nobreak >nul

:: Start Cloudflare Tunnel
echo [2/2] Starting Cloudflare Tunnel...
cd /d "D:\love-for-yjh"
start "Love-Tunnel" /min "C:\Program Files\nodejs\node.exe" run-cf-final.js

echo.
echo ===================================================
echo   Server started! Waiting for tunnel URL...
echo ===================================================
echo.

:: Wait for tunnel URL
:wait_url
timeout /t 3 /nobreak >nul
if not exist "D:\love-for-yjh\tunnel-url.txt" goto wait_url
set /p TUNNEL_URL=<"D:\love-for-yjh\tunnel-url.txt"

echo.
echo ===================================================
echo   Local:   http://127.0.0.1:8080
echo   LAN:     http://172.23.11.91:8080
echo   Public:  %TUNNEL_URL%
echo ===================================================
echo   Account: yjh / love520
echo   Press Ctrl+C to stop the server and tunnel
echo ===================================================
echo.

pause
