@echo off
cd /d "%~dp0"
title FIRA News Video Ready - Expo App
echo ================================
echo   FIRA News Video Ready
echo ================================
echo.
echo Dang xoa cache de QR dien thoai khong lay giao dien cu...
IF EXIST .expo rmdir /s /q .expo
IF EXIST .expo-shared rmdir /s /q .expo-shared
IF EXIST node_modules\.cache rmdir /s /q node_modules\.cache
IF EXIST .metro-cache rmdir /s /q .metro-cache
IF NOT EXIST node_modules (
  echo Chua co node_modules, dang cai thu vien bang npm install...
  npm install
)
IF NOT EXIST node_modules\react-native-webview (
  echo Dang cai lai thu vien video react-native-webview...
  npm install react-native-webview@13.15.0
)
set EXPO_PUBLIC_API_URL=http://localhost:4000/api
echo.
echo Luu y:
echo - Hay bat run_backend.bat truoc de API chay o cong 4000.
echo - Tren dien thoai hay tat han Expo Go roi quet QR moi.
echo - Tab Video co the bam anh, bam nut Xem hoac Mo man xem lon.
echo.
npx expo start --clear --lan
pause
