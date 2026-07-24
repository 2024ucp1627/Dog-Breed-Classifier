"""
Splits the Stanford Dogs Dataset into train/val/test folders.

Expects the raw dataset at: data/Images/<breed_folder>/*.jpg
Produces:
    data/train/<breed_folder>/*.jpg
    data/val/<breed_folder>/*.jpg
    data/test/<breed_folder>/*.jpg

Split ratio: 70% train / 15% val / 15% test, done per-breed so every
breed is represented proportionally in each split.
"""

import os
import random
import shutil
from pathlib import Path

# Reproducibility
random.seed(42)

SOURCE_DIR = Path("Images")
OUTPUT_DIR = Path(".")  # data/ is the current working directory

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
# TEST_RATIO is implied as the remainder (0.15)


def split_breed_folder(breed_folder: Path):
    images = list(breed_folder.glob("*.jpg"))
    random.shuffle(images)

    n_total = len(images)
    n_train = int(n_total * TRAIN_RATIO)
    n_val = int(n_total * VAL_RATIO)
    # remainder goes to test, avoids rounding losses

    train_files = images[:n_train]
    val_files = images[n_train:n_train + n_val]
    test_files = images[n_train + n_val:]

    return train_files, val_files, test_files


def copy_files(files, split_name: str, breed_name: str):
    dest_dir = OUTPUT_DIR / split_name / breed_name
    dest_dir.mkdir(parents=True, exist_ok=True)
    for f in files:
        shutil.copy2(f, dest_dir / f.name)


def main():
    if not SOURCE_DIR.exists():
        raise FileNotFoundError(
            f"Expected {SOURCE_DIR} to exist. Run this script from inside the data/ folder."
        )

    breed_folders = sorted([p for p in SOURCE_DIR.iterdir() if p.is_dir()])
    print(f"Found {len(breed_folders)} breed folders.\n")

    total_train, total_val, total_test = 0, 0, 0

    for breed_folder in breed_folders:
        breed_name = breed_folder.name
        train_files, val_files, test_files = split_breed_folder(breed_folder)

        copy_files(train_files, "train", breed_name)
        copy_files(val_files, "val", breed_name)
        copy_files(test_files, "test", breed_name)

        total_train += len(train_files)
        total_val += len(val_files)
        total_test += len(test_files)

    print("Split complete.")
    print(f"  Train: {total_train} images")
    print(f"  Val:   {total_val} images")
    print(f"  Test:  {total_test} images")
    print(f"  Total: {total_train + total_val + total_test} images")


if __name__ == "__main__":
    main()
