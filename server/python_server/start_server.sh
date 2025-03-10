#!/bin/bash

echo "Starting Python server..."

# Navigate to the python_server directory
cd "$(dirname "$0")" || exit 1

# Create virtual environment if it does not exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv || { echo "Failed to create virtual environment"; exit 1; }
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate || { echo "Failed to activate virtual environment"; exit 1; }

# Upgrade pip
pip install --upgrade pip || { echo "Failed to upgrade pip"; exit 1; }
echo "Pip upgraded"         
# Install required dependencies
pip install -r requirements.txt || { echo "Failed to install dependencies"; exit 1; }
echo "Dependencies installed"

echo "Running in development mode..."
python app.py
