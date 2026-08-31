import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


class Config:
    CV_DATA_PATH = BASE_DIR / "data" / "cv.json"
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"
