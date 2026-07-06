from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2, preprocess_input, decode_predictions
)
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

model = MobileNetV2(weights="imagenet")

@app.get("/")
def read_root():
    return {"message": "Dog Breed Classifier"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    
    contents = await file.read()

   
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((224, 224))

    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    
    predictions = model.predict(img_array)
    decoded = decode_predictions(predictions, top=3)[0]

    results = [
        {"breed": label, "confidence": round(float(confidence) * 100, 2)}
        for (_, label, confidence) in decoded
    ]

    return {"predictions": results}