@echo off
title EH Renovations - GitHub Sync
echo ===================================================
echo     EH Renovations Website ^& Gallery Auto-Sync
echo ===================================================
echo.

:: 1. Scan folders for images
echo [1/4] Scanning image directories for changes...
powershell -ExecutionPolicy Bypass -File .\scan-images.ps1
if %errorlevel% neq 0 (
    echo [ERROR] Image scanning failed!
    goto error
)
echo.

:: 2. Stage changes
echo [2/4] Staging changes in Git...
git add .
if %errorlevel% neq 0 (
    echo [ERROR] Git staging failed!
    goto error
)
echo.

:: 3. Commit changes with a timestamp
echo [3/4] Committing changes...
for /f "usebackq tokens=*" %%i in (`powershell -Command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"`) do set "timestamp=%%i"
git commit -m "Auto-update gallery: %timestamp%"
if %errorlevel% neq 0 (
    echo [INFO] No changes detected to commit, or commit already up to date.
)
echo.

:: 4. Push to GitHub
echo [4/4] Pushing changes to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [ERROR] Git push failed!
    goto error
)
echo.

echo ===================================================
echo [SUCCESS] Website and Gallery are successfully updated!
echo Your changes will be live on the web in 1-2 minutes.
echo ===================================================
goto end

:error
echo.
echo ===================================================
echo [FAILED] Sync failed. Check the error messages above.
echo ===================================================

:end
echo.
pause
