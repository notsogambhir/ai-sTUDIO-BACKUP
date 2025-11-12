@echo off
REM =================================================================================
REM OBE Portal Windows Setup Script
REM =================================================================================
REM This script will guide you through setting up the OBE Portal project on a
REM Windows machine. It automates most steps but will require you to perform
REM a few manual actions.

:: Set colors for output
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Yellow'; Write-Host '--- OBE Portal Windows Setup ---'; $host.UI.RawUI.ForegroundColor = 'White'; }"

echo.
echo =================================================================================
echo  STEP 1: PREREQUISITES - MANUAL INSTALLATION
echo =================================================================================
echo.
echo Please ensure you have the following software installed and that their
echo executables are available in your system's PATH:
echo.
echo   - Python 3.9+ (from python.org)
echo   - Node.js 16+ (from nodejs.org)
echo   - PostgreSQL 13+ (from postgresql.org)
echo.
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Yellow'; Write-Host 'IMPORTANT: During PostgreSQL installation, remember the password you set for the ''postgres'' user.'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.
pause

echo.
echo =================================================================================
echo  STEP 2: DATABASE SETUP - MANUAL ACTION REQUIRED
echo =================================================================================
echo.
echo You now need to create the database and a user for the application.
echo Please open 'SQL Shell (psql)' or another PostgreSQL client and run the
echo following commands.
echo.
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Cyan'; }"
echo   CREATE DATABASE obe_portal_db;
echo   CREATE USER obe_user WITH PASSWORD 'obe_password';
echo   GRANT ALL PRIVILEGES ON DATABASE obe_portal_db TO obe_user;
echo   \q
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.
echo After running these commands, the script will continue.
echo.
pause

echo.
echo =================================================================================
echo  STEP 3: BACKEND SETUP - AUTOMATED
echo =================================================================================
echo.
powershell -Command "& { Write-Host 'Changing to backend directory...' }"
cd obe-portal-backend

powershell -Command "& { Write-Host 'Creating Python virtual environment in ''venv''...' }"
python -m venv venv

powershell -Command "& { Write-Host 'Activating virtual environment...' }"
call venv\Scripts\activate.bat

powershell -Command "& { Write-Host 'Installing backend dependencies from requirements.txt...' }"
pip install -r requirements.txt

powershell -Command "& { Write-Host 'Creating .env file for database connection...' }"
(
    echo SECRET_KEY=your_secret_key_for_development_only_change_in_production
    echo DJANGO_SETTINGS_MODULE=obe_portal.settings
    echo DB_NAME=obe_portal_db
    echo DB_USER=obe_user
    echo DB_PASSWORD=obe_password
    echo DB_HOST=localhost
    echo DB_PORT=5432
) > .env

powershell -Command "& { Write-Host 'Running database migrations...' }"
python manage.py migrate

powershell -Command "& { Write-Host 'Deactivating virtual environment...' }"
call venv\Scripts\deactivate.bat

powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Green'; Write-Host 'Backend setup complete!'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.
pause

echo.
echo =================================================================================
echo  STEP 4: DATABASE SEEDING - MANUAL ACTION REQUIRED
echo =================================================================================
echo.
echo The database tables have been created. Now, you need to populate them with
echo the initial data.
echo.
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Yellow'; Write-Host 'IMPORTANT: This next command will ask for the password for the ''obe_user'', which is ''obe_password''.'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.
echo Please run the following command in this terminal:
echo.
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Cyan'; Write-Host 'psql -U obe_user -d obe_portal_db -a -f data_insertion.sql.txt'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.
pause

echo.
echo =================================================================================
echo  STEP 5: FRONTEND SETUP - AUTOMATED
echo =================================================================================
echo.
powershell -Command "& { Write-Host 'Changing to root directory...' }"
cd ..

powershell -Command "& { Write-Host 'Installing frontend dependencies from package.json...' }"
npm install --legacy-peer-deps

powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Green'; Write-Host 'Frontend setup complete!'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.
pause

echo.
echo =================================================================================
echo  STEP 6: LAUNCHING THE APPLICATION - AUTOMATED
echo =================================================================================
echo.
echo The script will now start both the backend and frontend servers in
echo separate command prompt windows.
echo.
powershell -Command "& { $host.UI.RawUI.ForegroundColor = 'Green'; Write-Host 'Setup complete! Enjoy the application.'; $host.UI.RawUI.ForegroundColor = 'White'; }"
echo.

start "OBE Portal Backend" cmd /k "cd obe-portal-backend && call venv\Scripts\activate.bat && python manage.py runserver"
start "OBE Portal Frontend" cmd /c "npm run dev"

exit
