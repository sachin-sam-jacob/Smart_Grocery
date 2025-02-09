import os
import json
import requests
import numpy as np
from PIL import Image
import tensorflow as tf
from pymongo import MongoClient
import logging
from bson import ObjectId
import shutil
from sklearn.model_selection import train_test_split

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductDatasetManager:
    def __init__(self):
        self.model = tf.keras.applications.ResNet50(
            weights='imagenet',
            include_top=True,
            input_shape=(224, 224, 3)
        )
        self.dataset_path = os.path.join(os.path.dirname(__file__), 'product_dataset')
        self.features_path = os.path.join(self.dataset_path, 'features')
        self.images_path = os.path.join(self.dataset_path, 'images')
        
        # Update MongoDB connection
        MONGODB_URI = 'mongodb://localhost:27017/ecommerce'  # Update this if needed
        try:
            self.db_client = MongoClient(MONGODB_URI)
            self.db = self.db_client.get_database()
            # Test connection
            self.db.command('ping')
            logger.info("Successfully connected to MongoDB")
        except Exception as e:
            logger.error(f"MongoDB connection error: {str(e)}")
            raise
        
        # Create directories if they don't exist
        os.makedirs(self.dataset_path, exist_ok=True)
        os.makedirs(self.features_path, exist_ok=True)
        os.makedirs(self.images_path, exist_ok=True)

    def download_product_images(self):
        """Download product images from MongoDB and save locally"""
        try:
            # Count total products
            total_products = self.db.products.count_documents({})
            logger.info(f"Found {total_products} products in database")
            
            if total_products == 0:
                logger.warning("No products found in database!")
                return

            # Get all products with images
            products = self.db.products.find(
                {"images": {"$exists": True, "$ne": []}},
                {'images': 1, 'name': 1, 'category': 1}
            )
            
            downloaded_count = 0
            for product in products:
                try:
                    if 'images' in product and product['images']:
                        image_url = product['images'][0]  # Get first image
                        product_id = str(product['_id'])
                        image_path = os.path.join(self.images_path, f"{product_id}.jpg")
                        
                        # Skip if image already exists
                        if os.path.exists(image_path):
                            logger.debug(f"Image already exists for product: {product['name']}")
                            downloaded_count += 1
                            continue

                        # Download and save image
                        response = requests.get(image_url)
                        if response.status_code == 200:
                            with open(image_path, 'wb') as f:
                                f.write(response.content)
                            logger.info(f"Downloaded image for product: {product['name']}")
                            downloaded_count += 1
                        else:
                            logger.warning(f"Failed to download image for product: {product['name']} (Status: {response.status_code})")
                            
                except Exception as e:
                    logger.error(f"Error processing product {product.get('name', 'unknown')}: {str(e)}")
            
            logger.info(f"Downloaded {downloaded_count} images out of {total_products} products")

        except Exception as e:
            logger.error(f"Error in download_product_images: {str(e)}")
            raise

    def extract_features(self):
        """Extract features from all product images"""
        try:
            image_files = [f for f in os.listdir(self.images_path) 
                          if f.endswith(('.jpg', '.jpeg', '.png'))]
            
            if not image_files:
                logger.warning("No images found to extract features from!")
                return
            
            logger.info(f"Found {len(image_files)} images for feature extraction")
            features_dict = {}
            
            for image_file in image_files:
                try:
                    image_path = os.path.join(self.images_path, image_file)
                    product_id = os.path.splitext(image_file)[0]
                    
                    # Load and preprocess image
                    img = Image.open(image_path).convert('RGB')
                    img = img.resize((224, 224))
                    img_array = np.array(img)
                    img_array = np.expand_dims(img_array, axis=0)
                    img_array = tf.keras.applications.resnet50.preprocess_input(img_array)
                    
                    # Extract features
                    features = self.model.predict(img_array, verbose=0)
                    features_dict[product_id] = features.flatten()
                    
                    logger.info(f"Extracted features for product: {product_id}")
                    
                except Exception as e:
                    logger.error(f"Error extracting features for {image_file}: {str(e)}")
            
            if features_dict:
                # Save features
                features_file = os.path.join(self.features_path, 'product_features.npz')
                np.savez_compressed(features_file, **features_dict)
                logger.info(f"Saved features for {len(features_dict)} products")
            else:
                logger.warning("No features were extracted!")

        except Exception as e:
            logger.error(f"Error in extract_features: {str(e)}")
            raise

    def create_product_index(self):
        """Create a searchable index of products"""
        try:
            # Get all products
            products = self.db.products.find({}, {
                'name': 1, 
                'description': 1, 
                'category': 1,
                'images': 1,
                'price': 1
            })
            
            index_data = {}
            for product in products:
                product_id = str(product['_id'])
                if os.path.exists(os.path.join(self.images_path, f"{product_id}.jpg")):
                    index_data[product_id] = {
                        'name': product.get('name', ''),
                        'description': product.get('description', ''),
                        'category': product.get('category', ''),
                        'price': product.get('price', 0),
                        'image_path': f"{product_id}.jpg"
                    }
            
            if index_data:
                # Save index
                index_file = os.path.join(self.dataset_path, 'product_index.json')
                with open(index_file, 'w', encoding='utf-8') as f:
                    json.dump(index_data, f, indent=2, ensure_ascii=False)
                logger.info(f"Created index for {len(index_data)} products")
            else:
                logger.warning("No products found for indexing!")

        except Exception as e:
            logger.error(f"Error in create_product_index: {str(e)}")
            raise

    def prepare_dataset(self):
        """Prepare the complete dataset"""
        try:
            logger.info("Starting dataset preparation...")
            self.download_product_images()
            self.extract_features()
            self.create_product_index()
            logger.info("Dataset preparation completed")
        except Exception as e:
            logger.error(f"Dataset preparation failed: {str(e)}")
            raise

def prepare_dataset(data_dir, output_dir, train_size=0.7, val_size=0.15, test_size=0.15):
    """
    Organize dataset into train, validation and test sets
    """
    try:
        # Create output directories
        os.makedirs(output_dir, exist_ok=True)
        train_dir = os.path.join(output_dir, 'train')
        val_dir = os.path.join(output_dir, 'validation')
        test_dir = os.path.join(output_dir, 'test')
        
        for dir_path in [train_dir, val_dir, test_dir]:
            os.makedirs(dir_path, exist_ok=True)
        
        # Get all classes (subdirectories)
        classes = [d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))]
        
        for class_name in classes:
            logger.info(f"Processing class: {class_name}")
            
            # Create class directories in each split
            os.makedirs(os.path.join(train_dir, class_name), exist_ok=True)
            os.makedirs(os.path.join(val_dir, class_name), exist_ok=True)
            os.makedirs(os.path.join(test_dir, class_name), exist_ok=True)
            
            # Get all images for this class
            class_dir = os.path.join(data_dir, class_name)
            images = [f for f in os.listdir(class_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            
            if len(images) == 0:
                logger.warning(f"No images found for class {class_name}")
                continue
                
            # Split into train/val/test
            train_imgs, test_val_imgs = train_test_split(images, train_size=train_size, random_state=42)
            val_imgs, test_imgs = train_test_split(test_val_imgs, test_size=0.5, random_state=42)
            
            # Copy images to respective directories
            for img, target_dir in [
                (train_imgs, train_dir),
                (val_imgs, val_dir),
                (test_imgs, test_dir)
            ]:
                for img_name in img:
                    src = os.path.join(class_dir, img_name)
                    dst = os.path.join(target_dir, class_name, img_name)
                    shutil.copy2(src, dst)
            
            logger.info(f"Split {len(images)} images into {len(train_imgs)} train, {len(val_imgs)} validation, {len(test_imgs)} test")
            
        return True
        
    except Exception as e:
        logger.error(f"Error preparing dataset: {str(e)}")
        return False

if __name__ == "__main__":
    # Set your paths here
    DATA_DIR = "raw_dataset"  # Your original dataset directory
    OUTPUT_DIR = "processed_dataset"  # Where to save the split dataset
    
    success = prepare_dataset(DATA_DIR, OUTPUT_DIR)
    if success:
        logger.info("Dataset preparation completed successfully")
    else:
        logger.error("Dataset preparation failed") 