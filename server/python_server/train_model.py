import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_model(num_classes):
    """Create a MobileNetV2-based model"""
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    
    # Freeze the base model
    base_model.trainable = False
    
    # Add custom layers
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(1024, activation='relu')(x)
    x = Dropout(0.5)(x)
    x = Dense(512, activation='relu')(x)
    x = Dropout(0.3)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    return model

def train_model(train_dir, val_dir, epochs=50, batch_size=32):
    """Train the model"""
    try:
        # Data augmentation for training
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            fill_mode='nearest'
        )

        # Only rescaling for validation
        val_datagen = ImageDataGenerator(rescale=1./255)

        # Load datasets
        train_generator = train_datagen.flow_from_directory(
            train_dir,
            target_size=(224, 224),
            batch_size=batch_size,
            class_mode='categorical'
        )

        validation_generator = val_datagen.flow_from_directory(
            val_dir,
            target_size=(224, 224),
            batch_size=batch_size,
            class_mode='categorical'
        )

        # Create and compile model
        num_classes = len(train_generator.class_indices)
        model = create_model(num_classes)
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )

        # Callbacks
        early_stopping = tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        )

        checkpoint = tf.keras.callbacks.ModelCheckpoint(
            'best_model.keras',
            monitor='val_accuracy',
            save_best_only=True,
            mode='max'
        )

        # Train the model
        history = model.fit(
            train_generator,
            epochs=epochs,
            validation_data=validation_generator,
            callbacks=[early_stopping, checkpoint]
        )

        # Save the final model with .keras extension
        model.save('final_model.keras')
        
        # Save class indices
        import json
        with open('class_indices.json', 'w') as f:
            json.dump(train_generator.class_indices, f)

        # Save training history
        history_dict = {
            'accuracy': [float(x) for x in history.history['accuracy']],
            'val_accuracy': [float(x) for x in history.history['val_accuracy']],
            'loss': [float(x) for x in history.history['loss']],
            'val_loss': [float(x) for x in history.history['val_loss']]
        }
        with open('training_history.json', 'w') as f:
            json.dump(history_dict, f)

        return history, model
        
    except Exception as e:
        logger.error(f"Error training model: {str(e)}")
        return None, None

def cleanup_old_models():
    """Remove old model files to avoid confusion"""
    try:
        old_files = [
            'best_model.h5',
            'final_model.h5',
            'best_model.keras',
            'final_model.keras'
        ]
        for file in old_files:
            if os.path.exists(file):
                os.remove(file)
                logger.info(f"Removed old model file: {file}")
    except Exception as e:
        logger.error(f"Error cleaning up old models: {str(e)}")

if __name__ == "__main__":
    # Set your paths here
    TRAIN_DIR = "processed_dataset/train"
    VAL_DIR = "processed_dataset/validation"
    
    # Clean up old models before training
    cleanup_old_models()
    
    # Train new model
    history, model = train_model(TRAIN_DIR, VAL_DIR)
    if history:
        logger.info("Model training completed successfully")
    else:
        logger.error("Model training failed") 