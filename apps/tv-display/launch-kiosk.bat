@echo off
REM Kiosk Mode Launcher for TV Display (Windows)
REM This script launches Chrome in kiosk mode with autoplay enabled
REM Use this for dedicated TV displays in hospital environments

echo.
echo ========================================
echo   TV Display - Kiosk Mode Launcher
echo ========================================
echo.

SET TV_URL=https://geraldina-queue-manager-tv.web.app

REM Try standard Chrome installation path
IF EXIST "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo Starting TV Display in kiosk mode...
    echo.
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
        --kiosk ^
        --autoplay-policy=no-user-gesture-required ^
        --disable-infobars ^
        --disable-session-crashed-bubble ^
        --disable-restore-session-state ^
        --start-fullscreen ^
        --noerrdialogs ^
        --disable-translate ^
        --no-first-run ^
        "%TV_URL%"

    echo.
    echo TV Display launched successfully!
    echo Sound notifications will play automatically.
    echo.
    echo Press Alt+F4 to exit kiosk mode.
    echo.
    goto :end
)

REM Try 32-bit Chrome path
IF EXIST "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo Starting TV Display in kiosk mode...
    echo.
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" ^
        --kiosk ^
        --autoplay-policy=no-user-gesture-required ^
        --disable-infobars ^
        --disable-session-crashed-bubble ^
        --disable-restore-session-state ^
        --start-fullscreen ^
        --noerrdialogs ^
        --disable-translate ^
        --no-first-run ^
        "%TV_URL%"

    echo.
    echo TV Display launched successfully!
    echo Sound notifications will play automatically.
    echo.
    echo Press Alt+F4 to exit kiosk mode.
    echo.
    goto :end
)

REM Chrome not found
echo ERROR: Google Chrome not found!
echo.
echo Please install Google Chrome from:
echo https://www.google.com/chrome/
echo.
pause
goto :end

:end
