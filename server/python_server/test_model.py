import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import json
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_and_preprocess_image(image_path):
    """Load and preprocess a single image"""
    img = load_img(image_path, target_size=(224, 224))
    img_array = img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array / 255.0

def test_model(model_path, test_dir, class_indices_path):
    """Test the model on the test set"""
    try:
        # Update model path to use .keras extension
        if not model_path.endswith('.keras'):
            model_path = model_path.replace('.h5', '.keras')
            
        # Load model and class indices
        model = tf.keras.models.load_model(model_path)
        with open(class_indices_path, 'r') as f:
            class_indices = json.load(f)
        
        # Invert class indices
        idx_to_class = {v: k for k, v in class_indices.items()}
        
        correct = 0
        total = 0
        
        # Test each class
        for class_name in os.listdir(test_dir):
            class_dir = os.path.join(test_dir, class_name)
            if not os.path.isdir(class_dir):
                continue
                
            # Test each image
            for img_name in os.listdir(class_dir):
                if not img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    continue
                    
                img_path = os.path.join(class_dir, img_name)
                img_array = load_and_preprocess_image(img_path)
                
                # Make prediction
                predictions = model.predict(img_array)
                predicted_class = idx_to_class[np.argmax(predictions[0])]
                
                if predicted_class == class_name:
                    correct += 1
                total += 1
                
                if total % 100 == 0:
                    logger.info(f"Processed {total} images, accuracy: {(correct/total)*100:.2f}%")
        
        final_accuracy = (correct/total)*100
        logger.info(f"Final accuracy: {final_accuracy:.2f}%")
        return final_accuracy
        
    except Exception as e:
        logger.error(f"Error testing model: {str(e)}")
        return None

if __name__ == "__main__":
    # Update model path to use .keras extension
    MODEL_PATH = "best_model.keras"  # Changed from .h5 to .keras
    TEST_DIR = "processed_dataset/test"
    CLASS_INDICES_PATH = "class_indices.json"
    
    accuracy = test_model(MODEL_PATH, TEST_DIR, CLASS_INDICES_PATH)
    if accuracy:
        logger.info("Model testing completed successfully")
    else:
        logger.error("Model testing failed") 