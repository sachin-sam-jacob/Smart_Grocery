#!/bin/bash
echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing requirements..."
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "Setup complete!"
echo "To start the server, run: python app.py" 