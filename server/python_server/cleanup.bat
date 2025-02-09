@echo off
echo Cleaning up unnecessary files...

del /q prepare_dataset.sh
del /q setup_env.bat
del /q setup_tests.py
del /q visual_search.log
del /q requirements.txt

rmdir /s /q product_dataset
rmdir /s /q venv

echo Cleanup complete!
pause 