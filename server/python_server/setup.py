import subprocess
import sys
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_requirements():
    """Install required packages"""
    requirements = [
        'tensorflow',
        'numpy',
        'Pillow',
        'scikit-learn',
        'pymongo',
        'requests',
        'opencv-python',
        'flask',
        'flask-cors'
    ]
    
    logger.info("Installing required packages...")
    for package in requirements:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            logger.info(f"Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install {package}: {str(e)}")
            return False
    return True

def create_directories():
    """Create necessary directories"""
    directories = [
        'raw_dataset',
        'processed_dataset',
        'processed_dataset/train',
        'processed_dataset/validation',
        'processed_dataset/test',
        'models'
    ]
    
    logger.info("Creating directories...")
    for directory in directories:
        try:
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Created directory: {directory}")
        except Exception as e:
            logger.error(f"Failed to create directory {directory}: {str(e)}")
            return False
    return True

def setup_environment():
    """Setup the complete environment"""
    if not install_requirements():
        logger.error("Failed to install requirements")
        return False
        
    if not create_directories():
        logger.error("Failed to create directories")
        return False
        
    logger.info("Environment setup completed successfully")
    return True

if __name__ == "__main__":
    setup_environment()