@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ====================================================
echo   FIRA NEWS - NAP DATABASE VAO MYSQL
echo ====================================================
echo.

set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if not exist "%MYSQL_PATH%" (
  set "MYSQL_PATH=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
)

if not exist "%MYSQL_PATH%" (
  echo [LỖI] Không tìm thấy mysql.exe tự động.
  echo Bạn hãy mở file fira_news_database.sql trong MySQL Workbench để chạy nhé!
  pause
  exit /b 1
)

echo Đang nạp database fira_news từ file fira_news_database.sql...
"%MYSQL_PATH%" -u root -p123456 --default-character-set=utf8mb4 -e "source %~dp0fira_news_database.sql"

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ====================================================
  echo   NẠP DATABASE THÀNH CÔNG VÀO MYSQL WORKBENCH!
  echo ====================================================
) else (
  echo.
  echo [LỖI] Quá trình nạp thất bại. Vui lòng kiểm tra lại MySQL Server.
)

pause
