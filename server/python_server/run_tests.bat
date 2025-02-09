@echo off
echo Running tests...

echo.
echo Testing MongoDB connection...
python test_db.py

echo.
echo Testing image recognition...
python test_recognition.py

pause 