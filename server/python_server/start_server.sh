#!/bin/bash

echo "Starting Python server..."

# Navigate to the python_server directory
cd "$(dirname "$0")"

# Create virtual environment if it does not exist
if [ ! -d "virtual_env" ]; then
    echo "Creating virtual environment..."
    python -m venv virtual_env
fi

# Activate virtual environment
source virtual_env/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install required dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
