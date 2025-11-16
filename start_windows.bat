@echo off
REM =================================================================================
REM OBE Portal Windows Start Script
REM =================================================================================
REM This script starts the development servers for both the backend and frontend.
REM Use this for daily development after you have completed the initial setup
REM using the setup_windows.bat script.

echo.
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Green'; Write-Host '--- Starting OBE Portal Application ---'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.

echo Launching backend server in a new window...
start "OBE Portal Backend" cmd /k "cd obe-portal-backend && call venv\Scripts\activate.bat && python manage.py runserver"

echo Launching frontend server in a new window...
start "OBE Portal Frontend" cmd /c "npm run dev"

echo.
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Yellow'; Write-Host 'Two new windows have been opened for the backend and frontend servers.'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.

exit
