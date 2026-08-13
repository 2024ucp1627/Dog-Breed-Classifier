# 🐕 Dog Breed Classifier

A full-stack machine learning application that identifies dog breeds from photos, built end-to-end: fine-tuned computer vision model, FastAPI backend, React frontend, and production deployment.

**🔗 Live demo:** [dog-breed-classifier-gilt.vercel.app](https://dog-breed-classifier-gilt.vercel.app)
**🔗 API:** [dog-breed-classifier-cyls.onrender.com](https://dog-breed-classifier-cyls.onrender.com)

> **Note:** The backend is hosted on Render's free tier, which spins down after periods of inactivity. The first prediction after a period of idleness may take 30–60 seconds while the server wakes up — subsequent requests are fast.

---

## Overview

This project classifies dog photos into **120 breeds** using a MobileNetV2 model fine-tuned on the Stanford Dogs Dataset. Rather than relying on the generic ImageNet-pretrained model (which recognizes "dog" but isn't tuned to distinguish between similar breeds), this model was trained specifically on breed-labeled data with a full evaluation pipeline to validate real-world performance.

## Model Performance

- **Test accuracy:** 81.00% across 120 breeds
- **Macro F1 score:** 0.806
- Trained with a two-phase fine-tuning strategy (frozen-base head training, followed by partial unfreezing), data augmentation, and early stopping to prevent overfitting

### Error Analysis

The model's mistakes are concentrated almost entirely on breeds that are genuinely difficult to distinguish visually — not random errors. Top confusions include:

| True Breed | Confused With | Why |
|---|---|---|
| Siberian husky | Eskimo dog | Near-identical build and coloring |
| Cardigan | Pembroke | The two Corgi varieties, distinguished mainly by tail |
| Miniature poodle | Toy / standard poodle | Same breed, different size classes |
| Collie | Shetland sheepdog | Shelties are bred to resemble miniature collies |
| Walker hound | Beagle | Both scent hounds with similar coloring |

This pattern — errors clustering around breeds that are hard for humans to distinguish too — is evidence the model learned genuine visual features rather than dataset artifacts.

Full evaluation artifacts (per-class precision/recall/F1, confusion matrix, complete confusion pair analysis) are in [`backend/reports/`](backend/reports/).

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌────────────────────┐
│  React Frontend  │ ──────> │  FastAPI Backend  │ ──────> │  TFLite Model       │
│  (Vercel)        │  HTTP   │  (Render, Docker)  │         │  MobileNetV2 (FT)   │
└─────────────────┘         └──────────────────┘         └────────────────────┘
```

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion, deployed on Vercel
- **Backend:** FastAPI serving a TensorFlow Lite model, containerized with Docker, deployed on Render
- **Model:** MobileNetV2, fine-tuned on the Stanford Dogs Dataset, converted to TFLite for a lightweight production footprint

## ML Pipeline

1. **Baseline** — wired the ImageNet-pretrained MobileNetV2 into a working `/predict` endpoint end-to-end
2. **Fine-tuning** — retrained on the [Stanford Dogs Dataset](http://vision.stanford.edu/aditya86/ImageNetDogs/) (120 breeds, ~20,580 images), split 70/15/15 per breed
   - Phase 1: trained a new classification head with the MobileNetV2 base frozen
   - Phase 2: unfroze the top 30 base layers for low-learning-rate fine-tuning
   - Data augmentation (random flip/rotation/zoom) and `EarlyStopping` + `ModelCheckpoint` to counter overfitting on a relatively small per-class sample size (~120 images/breed)
3. **Evaluation** — held-out test set evaluation with per-class precision/recall/F1, a full confusion matrix, and systematic error analysis
4. **Deployment optimization** — converted the trained Keras model to TensorFlow Lite, cutting the serving footprint enough to run on free-tier hosting (512MB RAM)

## Features

- Drag-and-drop or click-to-upload image interface
- Top-3 breed predictions with confidence scores
- Prediction history (last 10, stored locally in-browser)
- Fully responsive design

## Tech Stack

**ML:** TensorFlow / Keras, MobileNetV2, TensorFlow Lite, scikit-learn (evaluation)
**Backend:** FastAPI, tflite-runtime, Docker
**Frontend:** React, Vite, Tailwind CSS v4, Framer Motion, lucide-react
**Deployment:** Render (backend), Vercel (frontend)

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8000` by default (see `src/App.jsx`).

### Retraining the Model

Training requires a separate environment with GPU-accelerated TensorFlow (see `backend/venv-train` setup notes in-repo for Apple Silicon / `tensorflow-metal` configuration).

```bash
cd backend
python data/split_dataset.py     # splits the Stanford Dogs Dataset into train/val/test
python train_model.py            # two-phase fine-tuning
python evaluate_model.py         # generates evaluation reports
```

## Project Structure

```
Dog-Breed-Classifier/
├── backend/
│   ├── main.py                  # FastAPI app, TFLite inference
│   ├── train_model.py           # fine-tuning pipeline
│   ├── evaluate_model.py        # evaluation + error analysis
│   ├── data/split_dataset.py    # dataset splitting
│   ├── models/                  # trained model + class names
│   ├── reports/                 # evaluation artifacts
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   └── components/
    └── package.json
```

## Acknowledgments

Trained on the [Stanford Dogs Dataset](http://vision.stanford.edu/aditya86/ImageNetDogs/) (Khosla et al.), built on MobileNetV2 pretrained on ImageNet.