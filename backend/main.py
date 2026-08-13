import json
from pathlib import Path

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import io

try:
    # Lightweight package used in production (see requirements-deploy.txt)
    import tflite_runtime.interpreter as tflite
except ImportError:
    # Fallback for local dev machines that have full tensorflow installed
    import tensorflow.lite as tflite

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path("models/dog_breed_classifier.tflite")
CLASS_NAMES_PATH = Path("models/class_names.json")

interpreter = tflite.Interpreter(model_path=str(MODEL_PATH))
interpreter.allocate_tensors()
INPUT_DETAILS = interpreter.get_input_details()
OUTPUT_DETAILS = interpreter.get_output_details()

with open(CLASS_NAMES_PATH) as f:
    RAW_CLASS_NAMES = json.load(f)


def clean_breed_name(name: str) -> str:
    """Turns 'n02085620-Chihuahua' into 'Chihuahua'."""
    return name.split("-", 1)[-1].replace("_", " ")


CLASS_NAMES = [clean_breed_name(n) for n in RAW_CLASS_NAMES]


def preprocess_image(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB").resize((224, 224))
    arr = np.array(img).astype(np.float32)
    arr = np.expand_dims(arr, axis=0)
    # MobileNetV2 preprocessing: scale to [-1, 1]
    arr = (arr / 127.5) - 1.0
    return arr


@app.get("/")
def read_root():
    return {"message": "Dog Breed Classifier — fine-tuned v2 (Stanford Dogs Dataset, TFLite)"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents))
    img_array = preprocess_image(img)

    interpreter.set_tensor(INPUT_DETAILS[0]["index"], img_array)
    interpreter.invoke()
    predictions = interpreter.get_tensor(OUTPUT_DETAILS[0]["index"])[0]

    top_indices = np.argsort(predictions)[::-1][:3]

    results = [
        {"breed": CLASS_NAMES[i], "confidence": round(float(predictions[i]) * 100, 2)}
        for i in top_indices
    ]

    return {"predictions": results}
