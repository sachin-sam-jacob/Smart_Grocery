from pymongo import MongoClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_mongodb():
    try:
        # Connect to MongoDB
        client = MongoClient('mongodb://localhost:27017/')
        db = client.ecommerce
        
        # Test connection
        db.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Count products
        product_count = db.products.count_documents({})
        logger.info(f"Found {product_count} products in database")
        
        # Sample some products
        if product_count > 0:
            sample_products = db.products.find().limit(3)
            logger.info("Sample products:")
            for product in sample_products:
                logger.info(f"- {product.get('name', 'No name')} (ID: {product['_id']})")
                logger.info(f"  Images: {len(product.get('images', []))}")
        
    except Exception as e:
        logger.error(f"MongoDB test failed: {str(e)}")
        raise

if __name__ == "__main__":
    test_mongodb() 