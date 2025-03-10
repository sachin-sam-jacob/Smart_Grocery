#!/bin/bash

echo "Starting Python server..."

# Navigate to the python_server directory
cd "$(dirname "$0")"

# Check if running in production environment
if [ "$NODE_ENV" = "production" ]; then
    # Production setup
    python -m pip install --upgrade pip
    pip install -r requirements.txt
    pip install gunicorn
    
    # Start with gunicorn
    gunicorn app:app --bind 0.0.0.0:5000 --workers 4
else
    # Development setup
    # Create virtual environment if it does not exist
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python -m venv venv
    fi

    # Activate virtual environment
    source venv/bin/activate || source venv/Scripts/activate

    # Install dependencies
    python -m pip install --upgrade pip
    pip install -r requirements.txt

    # Start Flask development server
    python app.py
fi
