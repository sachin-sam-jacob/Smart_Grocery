@echo off
echo Testing model with sample image...

REM Activate virtual environment if not already activated
if not defined VIRTUAL_ENV (
    call venv\Scripts\activate
)

python test_model.py test_images/blueberry.jpg
pause 