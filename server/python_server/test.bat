@echo off
echo Running tests...

REM Activate virtual environment if not already activated
if not defined VIRTUAL_ENV (
    call venv\Scripts\activate
)

echo.
echo Checking Python server...
python -c "import requests; requests.get('http://localhost:5000/health')" 2>nul
if errorlevel 1 (
    echo Python server is not running!
    echo Starting server in new window...
    start cmd /k "call venv\Scripts\activate && python app.py"
    echo Waiting for server to start...
    timeout /t 5
)

echo.
echo Creating test directory...
if not exist test_images mkdir test_images

echo.
echo Testing MongoDB connection...
python test_db.py

echo.
echo Testing image recognition...
python test_recognition.py

pause 