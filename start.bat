@echo off
chcp 65001 >nul 2>&1
title Love For YJH - 一键启动

echo ============================================
echo   Love For YJH - 一键启动脚本 (PM2守护)
echo ============================================
echo.

:: Start backend via PM2 (auto-restart on crash)
echo [1/2] 启动后端服务 (PM2守护进程)...
cd /d D:\love-for-yjh\backend
pm2 restart love-yjh-backend 2>nul || pm2 start src/server.js --name "love-yjh-backend"
pm2 save >nul 2>&1

:: Wait for backend to be ready
timeout /t 3 /nobreak >nul

:: Start Cloudflare Tunnel
echo [2/2] 启动 Cloudflare 隧道...
start "LoveForYJH-Tunnel" /min cmd /c "D:\cloudflared-new.exe tunnel --url http://localhost:8080 2>&1 | findstr /i trycloudflare > %USERPROFILE%\Desktop\love-for-yjh-url.txt"

:: Wait for tunnel to connect
echo.
echo 正在等待隧道连接...（约15-30秒）
timeout /t 25 /nobreak >nul

:: Display result
echo.
echo ============================================
echo   启动完成！
echo ============================================
echo.
echo   本地访问: http://localhost:8080
echo   后端通过 PM2 守护，崩溃会自动重启
echo.

if exist "%USERPROFILE%\Desktop\love-for-yjh-url.txt" (
    echo   外网访问:
    type "%USERPROFILE%\Desktop\love-for-yjh-url.txt"
    echo.
    echo   (网址已保存到桌面 love-for-yjh-url.txt)
) else (
    echo   外网访问: 隧道正在连接，请稍等片刻...
)

echo.
echo ============================================
echo   按任意键关闭此窗口（服务会继续运行）
echo ============================================
pause >nul
