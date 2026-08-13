"""
Fine-tunes MobileNetV2 on the Stanford Dogs Dataset.

Expects data/train, data/val, data/test folders (created by split_dataset.py),
each containing one subfolder per breed.

Two-phase training:
  Phase 1: freeze the MobileNetV2 base, train only the new classification head.
  Phase 2: unfreeze the top of the base model, fine-tune end-to-end at a low
           learning rate for a small accuracy boost.

Includes data augmentation (random flip/rotation/zoom) and callbacks
(ModelCheckpoint + EarlyStopping) to guard against overfitting, since the
dataset has only ~120 images per breed.

Saves the BEST model (by val_accuracy) to models/dog_breed_classifier.keras
and the class name list to models/class_names.json (needed at inference time
to map predicted indices back to breed names).
"""

import json
from pathlib import Path

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input

DATA_DIR = Path("data")
TRAIN_DIR = DATA_DIR / "train"
VAL_DIR = DATA_DIR / "val"
MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

PHASE1_EPOCHS = 15
PHASE2_EPOCHS = 15
PHASE2_UNFREEZE_LAYERS = 30  # unfreeze the last N layers of the base model
PHASE2_LR = 1e-5
EARLY_STOPPING_PATIENCE = 4

MODEL_PATH = MODEL_DIR / "dog_breed_classifier.keras"

data_augmentation = tf.keras.Sequential(
    [
        layers.RandomFlip("horizontal"),
        layers.RandomRotation(0.1),
        layers.RandomZoom(0.1),
    ],
    name="data_augmentation",
)


def build_datasets():
    train_ds = tf.keras.utils.image_dataset_from_directory(
        TRAIN_DIR,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        shuffle=True,
        seed=42,
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        VAL_DIR,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode="categorical",
        shuffle=False,
    )

    class_names = train_ds.class_names

    # MobileNetV2 preprocessing expects inputs scaled to [-1, 1]
    def preprocess(x, y):
        return preprocess_input(x), y

    train_ds = train_ds.map(preprocess).prefetch(tf.data.AUTOTUNE)
    val_ds = val_ds.map(preprocess).prefetch(tf.data.AUTOTUNE)

    return train_ds, val_ds, class_names


def build_model(num_classes):
    base_model = MobileNetV2(
        input_shape=IMG_SIZE + (3,),
        include_top=False,
        weights="imagenet",
    )
    base_model.trainable = False  # Phase 1: freeze the base

    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = data_augmentation(inputs)  # only active when training=True
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    model = models.Model(inputs, outputs)
    return model, base_model


def main():
    print("Loading datasets...")
    train_ds, val_ds, class_names = build_datasets()
    num_classes = len(class_names)
    print(f"Found {num_classes} classes.\n")

    with open(MODEL_DIR / "class_names.json", "w") as f:
        json.dump(class_names, f, indent=2)

    print("Building model...")
    model, base_model = build_model(num_classes)

    checkpoint_cb = tf.keras.callbacks.ModelCheckpoint(
        filepath=str(MODEL_PATH),
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    )
    early_stop_cb = tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=EARLY_STOPPING_PATIENCE,
        restore_best_weights=True,
        verbose=1,
    )

    # ---- Phase 1: train the classification head only ----
    print("\n=== Phase 1: training classification head (base frozen) ===")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
        jit_compile=False,  # tensorflow-metal doesn't reliably support XLA JIT yet
    )
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=PHASE1_EPOCHS,
        callbacks=[checkpoint_cb, early_stop_cb],
    )

    # ---- Phase 2: unfreeze top layers, fine-tune at low LR ----
    print(f"\n=== Phase 2: fine-tuning top {PHASE2_UNFREEZE_LAYERS} base layers ===")
    base_model.trainable = True
    for layer in base_model.layers[:-PHASE2_UNFREEZE_LAYERS]:
        layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=PHASE2_LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
        jit_compile=False,  # tensorflow-metal doesn't reliably support XLA JIT yet
    )
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=PHASE2_EPOCHS,
        callbacks=[checkpoint_cb, early_stop_cb],
    )

    print(f"\nBest model (by val_accuracy) saved to {MODEL_PATH}")
    print(f"Class names saved to {MODEL_DIR / 'class_names.json'}")


if __name__ == "__main__":
    main()
