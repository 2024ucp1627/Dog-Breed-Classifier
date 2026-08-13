"""
Evaluates the fine-tuned dog breed classifier on the held-out test set.

Produces:
  - Overall test accuracy
  - Per-class precision / recall / F1 (classification_report)
  - A confusion matrix heatmap saved as an image (120x120 is too large to
    read as text, so we visualize it instead)
  - Error analysis: the top N most-confused breed pairs, i.e. which breeds
    the model mixes up most often and how frequently

Run from the backend/ folder (same place as train_model.py):
    python evaluate_model.py
"""

import json
from pathlib import Path

import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
from sklearn.metrics import classification_report, confusion_matrix

DATA_DIR = Path("data")
TEST_DIR = DATA_DIR / "test"
MODEL_DIR = Path("models")
MODEL_PATH = MODEL_DIR / "dog_breed_classifier.keras"
CLASS_NAMES_PATH = MODEL_DIR / "class_names.json"

REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(exist_ok=True)

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
TOP_N_CONFUSIONS = 20  # how many confused breed-pairs to report


def clean_name(name: str) -> str:
    """Turns 'n02085620-Chihuahua' into 'Chihuahua'."""
    return name.split("-", 1)[-1].replace("_", " ")


def load_test_dataset():
    test_ds = tf.keras.utils.image_dataset_from_directory(
        TEST_DIR,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="int",
        shuffle=False,
    )
    class_names = test_ds.class_names

    def preprocess(x, y):
        return tf.keras.applications.mobilenet_v2.preprocess_input(x), y

    test_ds_processed = test_ds.map(preprocess).prefetch(tf.data.AUTOTUNE)
    return test_ds_processed, class_names


def main():
    print("Loading model...")
    model = tf.keras.models.load_model(MODEL_PATH)

    with open(CLASS_NAMES_PATH) as f:
        saved_class_names = json.load(f)

    print("Loading test dataset...")
    test_ds, class_names = load_test_dataset()

    if class_names != saved_class_names:
        print(
            "WARNING: class name order from the test directory doesn't match "
            "the order saved during training. Predictions may be mislabeled."
        )

    print("Running predictions on test set...\n")
    y_true = []
    y_pred = []

    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_pred.extend(np.argmax(preds, axis=1))
        y_true.extend(labels.numpy())

    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    display_names = [clean_name(n) for n in class_names]

    # ---- Overall accuracy ----
    accuracy = np.mean(y_true == y_pred)
    print(f"Overall test accuracy: {accuracy * 100:.2f}%\n")

    # ---- Per-class precision / recall / F1 ----
    report = classification_report(
        y_true, y_pred, target_names=display_names, digits=3, zero_division=0
    )
    report_path = REPORTS_DIR / "classification_report.txt"
    with open(report_path, "w") as f:
        f.write(f"Overall test accuracy: {accuracy * 100:.2f}%\n\n")
        f.write(report)
    print(f"Full per-class report saved to {report_path}")

    # ---- Confusion matrix heatmap ----
    cm = confusion_matrix(y_true, y_pred)
    fig, ax = plt.subplots(figsize=(22, 22))
    im = ax.imshow(cm, cmap="viridis")
    ax.set_xticks(range(len(display_names)))
    ax.set_yticks(range(len(display_names)))
    ax.set_xticklabels(display_names, rotation=90, fontsize=5)
    ax.set_yticklabels(display_names, fontsize=5)
    ax.set_xlabel("Predicted breed")
    ax.set_ylabel("True breed")
    ax.set_title(f"Confusion Matrix — Test Accuracy {accuracy * 100:.2f}%")
    fig.colorbar(im, ax=ax, fraction=0.03)
    fig.tight_layout()
    cm_path = REPORTS_DIR / "confusion_matrix.png"
    fig.savefig(cm_path, dpi=150)
    plt.close(fig)
    print(f"Confusion matrix heatmap saved to {cm_path}")

    # ---- Error analysis: top confused breed pairs ----
    confusions = []
    for i in range(len(display_names)):
        for j in range(len(display_names)):
            if i != j and cm[i, j] > 0:
                confusions.append((cm[i, j], display_names[i], display_names[j]))

    confusions.sort(reverse=True)

    error_report_path = REPORTS_DIR / "top_confusions.txt"
    with open(error_report_path, "w") as f:
        f.write(f"Top {TOP_N_CONFUSIONS} most-confused breed pairs (true -> predicted):\n\n")
        for count, true_breed, pred_breed in confusions[:TOP_N_CONFUSIONS]:
            line = f"{true_breed} -> {pred_breed}: {count} times\n"
            f.write(line)
            print(line.strip())

    print(f"\nTop confusions saved to {error_report_path}")
    print("\nEvaluation complete.")


if __name__ == "__main__":
    main()
