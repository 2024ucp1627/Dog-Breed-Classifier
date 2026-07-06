import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2, preprocess_input, decode_predictions
)
from tensorflow.keras.preprocessing import image
import numpy as np

# Load the pretrained model (downloads weights the first time you run this)
model = MobileNetV2(weights="imagenet")

def predict_breed(img_path):
    # Load and resize image to what the model expects (224x224)
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    # Run prediction
    predictions = model.predict(img_array)
    decoded = decode_predictions(predictions, top=3)[0]

    print("\nTop 3 predictions:")
    for i, (imagenet_id, label, confidence) in enumerate(decoded):
        print(f"{i+1}. {label}: {confidence*100:.2f}%")

if __name__ == "__main__":
    predict_breed("test_dog.jpg")