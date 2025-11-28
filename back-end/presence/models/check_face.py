#!/usr/bin/env python3
import sys
import os
import json
from deepface import DeepFace

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
KNOWN_DIR = os.path.join(BASE_DIR, "user", "api", "user", "student", "uploads")

def extract_student_id_from_filename(filename):
    try:
        basename = os.path.basename(filename)
        name = os.path.splitext(basename)[0]
        if name.startswith("student_"):
            return int(name.split("_")[1])
    except Exception:
        return None
    return None

def main():
    status = "error"  # valeur par défaut

    try:
        if len(sys.argv) < 2:
            status = "usage_error"
            print(json.dumps({"status": status}))
            return

        probe_path = sys.argv[1]
        expected_student_id = int(sys.argv[2]) if len(sys.argv) > 2 else None

        if not os.path.isfile(probe_path):
            status = "probe_missing"
            print(json.dumps({"status": status}))
            return

        if not os.path.isdir(KNOWN_DIR):
            status = "known_dir_missing"
            print(json.dumps({"status": status}))
            return

        known_images = [f for f in os.listdir(KNOWN_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if not known_images:
            status = "no_known_images"
            print(json.dumps({"status": status}))
            return

        result = DeepFace.find(
            img_path=probe_path,
            db_path=KNOWN_DIR,
            enforce_detection=False,
            model_name="VGG-Face",
            distance_metric="cosine"
        )

        if len(result) == 0 or result[0].empty:
            status = "not_found"
            print(json.dumps({"status": status}))
            return

        result[0] = result[0].sort_values(by=["distance"])
        match = result[0].iloc[0]
        distance = float(match["distance"])
        matched_id = extract_student_id_from_filename(os.path.basename(match["identity"]))

        CONFIDENCE_THRESHOLD = 0.55
        if distance > CONFIDENCE_THRESHOLD:
            status = "not_confident"
        else:
            status = "found"
            if expected_student_id is not None and matched_id != expected_student_id:
                status = "mismatch"

    except Exception:
        status = "error"

    print(json.dumps({"status": status}))

if __name__ == "__main__":
    main()
