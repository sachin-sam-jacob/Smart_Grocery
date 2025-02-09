@echo off
echo Starting model training pipeline...

echo Checking if raw dataset exists...
if not exist "raw_dataset\*.*" (
    echo Error: No dataset found in raw_dataset directory!
    echo Please place your dataset in the raw_dataset directory with the following structure:
    echo raw_dataset\
    echo    apple\
    echo        image1.jpg
    echo        image2.jpg
    echo    banana\
    echo        image1.jpg
    echo        image2.jpg
    echo    etc...
    pause
    exit /b 1
)

echo Step 1: Preparing dataset...
python prepare_dataset.py
if errorlevel 1 (
    echo Error in dataset preparation!
    pause
    exit /b 1
)

echo Step 2: Training model...
python train_model.py
if errorlevel 1 (
    echo Error in model training!
    pause
    exit /b 1
)

echo Step 3: Testing model...
python test_model.py
if errorlevel 1 (
    echo Error in model testing!
    pause
    exit /b 1
)

echo Moving model to models directory...
if not exist "models" mkdir models
move /y best_model.keras models\
move /y class_indices.json models\
move /y training_history.json models\

echo Training pipeline completed successfully!
pause 