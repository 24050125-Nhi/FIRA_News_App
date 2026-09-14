@echo off
cd /d "%~dp0"
title FIRA News Unified - Full Project
echo Dang mo Backend va App voi giao dien dong bo...
start "FIRA News Backend" cmd /k "cd /d %~dp0 && run_backend.bat"
timeout /t 3 /nobreak >nul
start "FIRA News Unified App" cmd /k "cd /d %~dp0 && run_app.bat"
