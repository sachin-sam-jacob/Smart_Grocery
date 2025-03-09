#!/bin/bash

echo "Starting Python server..."

# Navigate to the python_server directory (if needed)
cd "$(dirname "$0")"

# Activate virtual environment if not already activated
if [ -d "venv" ]; then
    source venv/bin/activate
fi
pip install -r requirements.txt
# Start the Flask server
python app.py
