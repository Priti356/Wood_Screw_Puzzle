@echo off
title Wood Puzzle Screw - Full Stack Server
echo ========================================================
echo   Launching Wood Puzzle Screw Server ^& Web Game...
echo ========================================================
echo.
timeout /t 1 /nobreak >nul
start http://127.0.0.1:8080
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0backend\server.ps1" -Port 8080
pause

