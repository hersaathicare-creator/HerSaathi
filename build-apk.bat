@echo off
setlocal

cd /d "%~dp0"
set NODE_ENV=production

echo.
echo HerSaathi local APK build
echo =========================
echo Cleaning Android build...

pushd android
call gradlew.bat clean assembleRelease --no-daemon --max-workers=2
set BUILD_STATUS=%ERRORLEVEL%
popd

echo.
if not "%BUILD_STATUS%"=="0" (
  echo APK build failed with exit code %BUILD_STATUS%.
  if not "%HERSAATHI_NO_PAUSE%"=="1" pause
  exit /b %BUILD_STATUS%
)

echo APK build complete.
echo Output:
echo %CD%\android\app\build\outputs\apk\release\app-release.apk
if not exist "%CD%\dist" mkdir "%CD%\dist"
copy /Y "%CD%\android\app\build\outputs\apk\release\app-release.apk" "%CD%\dist\HerSaathi-local-release.apk" >nul
echo Copy:
echo %CD%\dist\HerSaathi-local-release.apk
echo.

if not "%HERSAATHI_NO_PAUSE%"=="1" pause
exit /b 0
