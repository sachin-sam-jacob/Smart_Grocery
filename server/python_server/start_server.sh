#!/bin/bash

echo "Starting Python server..."

# Navigate to the python_server directory
cd "$(dirname "$0")"

# Create virtual environment if it does not exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install required dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
