@echo off
REM Windows Auto-Start Configuration Helper
REM This script helps configure the TV Display to start automatically on Windows boot

echo.
echo ========================================
echo   TV Display Auto-Start Setup
echo ========================================
echo.
echo This will configure the TV Display to launch automatically
echo when Windows starts.
echo.
echo Choose installation method:
echo.
echo [1] Startup Folder (Simple - requires user login)
echo [2] Show Task Scheduler instructions (Advanced - no login needed)
echo [3] Cancel
echo.

set /p choice="Enter choice (1, 2, or 3): "

if "%choice%"=="1" goto startup_folder
if "%choice%"=="2" goto task_scheduler
if "%choice%"=="3" goto cancel
echo Invalid choice. Please run again and choose 1, 2, or 3.
pause
goto :end

:startup_folder
echo.
echo Opening Startup folder...
echo.
explorer shell:startup
echo.
echo ----------------------------------------
echo INSTRUCTIONS:
echo ----------------------------------------
echo.
echo 1. Copy "launch-kiosk.bat" from Desktop
echo 2. Paste it into the Startup folder that just opened
echo    (or create a shortcut to it)
echo.
echo 3. Restart your computer to test
echo.
echo Done! The TV Display will now start automatically
echo when you log into Windows.
echo.
echo ----------------------------------------
pause
goto :end

:task_scheduler
echo.
echo Opening Task Scheduler...
echo.
start taskschd.msc
echo.
echo ----------------------------------------
echo TASK SCHEDULER INSTRUCTIONS:
echo ----------------------------------------
echo.
echo 1. In Task Scheduler, click "Create Task"
echo.
echo 2. GENERAL TAB:
echo    - Name: Hospital TV Display
echo    - [x] Run whether user is logged on or not
echo    - [x] Run with highest privileges
echo.
echo 3. TRIGGERS TAB:
echo    - Click "New..."
echo    - Begin the task: "At startup"
echo    - Delay: 30 seconds
echo    - Click OK
echo.
echo 4. ACTIONS TAB:
echo    - Click "New..."
echo    - Action: "Start a program"
echo    - Program: C:\Users\[USERNAME]\Desktop\launch-kiosk.bat
echo      ^(Replace [USERNAME] with your username^)
echo    - Click OK
echo.
echo 5. CONDITIONS TAB:
echo    - [ ] Uncheck "Start only if on AC power"
echo.
echo 6. SETTINGS TAB:
echo    - [x] If task fails, restart every: 1 minute
echo    - [x] Attempt to restart up to: 3 times
echo.
echo 7. Click OK to save
echo.
echo 8. Right-click task -^> Run to test
echo.
echo ----------------------------------------
echo.
echo For detailed instructions, see:
echo WINDOWS-SETUP-GUIDE.md
echo.
pause
goto :end

:cancel
echo.
echo Setup cancelled.
echo.
pause
goto :end

:end
