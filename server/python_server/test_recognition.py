import requests
import json
import os
from PIL import Image
import sys
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_server():
    """Check if the Python server is running"""
    try:
        response = requests.get('http://localhost:5000/health')
        if response.status_code == 200:
            logger.info("Server is running")
            return True
        return False
    except:
        logger.error("Server is not running!")
        logger.info("Please start the server using start_server.bat")
        return False

def test_image_recognition(image_path):
    """Test image recognition with a specific image"""
    try:
        # Verify server is running
        if not check_server():
            return
            
        # Verify image exists and can be opened
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            return
            
        img = Image.open(image_path)
        logger.info(f"Testing image: {os.path.basename(image_path)}")
        logger.info(f"Image size: {img.size}")
        
        # Prepare the image file
        with open(image_path, 'rb') as f:
            files = {'image': (os.path.basename(image_path), f, 'image/jpeg')}
            
            # Send to server
            response = requests.post(
                'http://localhost:5000/analyze',
                files=files
            )
            
            if response.status_code == 200:
                logger.info("Server Response:")
                print(json.dumps(response.json(), indent=2))
            else:
                logger.error(f"Error: Server returned status code {response.status_code}")
                logger.error(response.text)
        
    except Exception as e:
        logger.error(f"Error testing image: {str(e)}")

def main():
    # Get the directory containing this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(script_dir, 'test_images')
    
    # Create test directory if it doesn't exist
    os.makedirs(test_dir, exist_ok=True)
    
    # If image path provided as argument, test that specific image
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_image_recognition(image_path)
        return
    
    # Otherwise, test all images in test_images directory
    test_images = [f for f in os.listdir(test_dir) if f.endswith(('.jpg', '.jpeg', '.png'))]
    
    if not test_images:
        logger.warning("No test images found!")
        logger.info(f"Please add test images to: {test_dir}")
        return
    
    logger.info(f"Found {len(test_images)} test images")
    
    # Test each image
    for image_name in test_images:
        image_path = os.path.join(test_dir, image_name)
        test_image_recognition(image_path)

if __name__ == "__main__":
    main() 