import json
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path("models/dog_breed_classifier.keras")
CLASS_NAMES_PATH = Path("models/class_names.json")

model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH) as f:
    RAW_CLASS_NAMES = json.load(f)


def clean_breed_name(name: str) -> str:
    return name.split("-", 1)[-1].replace("_", " ")


CLASS_NAMES = [clean_breed_name(n) for n in RAW_CLASS_NAMES]


@app.get("/")
def read_root():
    return {"message": "Dog Breed Classifier — fine-tuned v2 (Stanford Dogs Dataset)"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()

    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((224, 224))

    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    predictions = model.predict(img_array, verbose=0)[0]
    top_indices = np.argsort(predictions)[::-1][:3]

    results = [
        {"breed": CLASS_NAMES[i], "confidence": round(float(predictions[i]) * 100, 2)}
        for i in top_indices
    ]

    return {"predictions": results}
