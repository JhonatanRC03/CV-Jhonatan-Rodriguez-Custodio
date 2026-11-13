import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

load_dotenv(BASE_DIR / ".env")


class Config:
    DATA_DIR = BASE_DIR / "data"
    CV_DATA_PATH = DATA_DIR / "cv.json"
    PROJECTS_DIR = DATA_DIR / "projects"

    # El frontend estático vive junto al backend; Flask lo sirve si no hay otro servidor.
    FRONTEND_DIR = BASE_DIR.parent / "frontend"

    # Idiomas del contenido. El primero es el original; el resto son traducciones
    # en data/<lang>/ con la misma estructura de archivos.
    LANGUAGES = ("es", "en")
    DEFAULT_LANGUAGE = "es"

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"

    AZURE_AI_ENDPOINT = os.getenv("AZURE_AI_ENDPOINT", "")
    AZURE_AI_API_KEY = os.getenv("AZURE_AI_API_KEY", "")
    AZURE_AI_DEPLOYMENT = os.getenv("AZURE_AI_DEPLOYMENT", "gpt-5")
    AZURE_AI_API_VERSION = os.getenv("AZURE_AI_API_VERSION", "2025-04-01-preview")

    CHAT_MAX_QUESTIONS = int(os.getenv("CHAT_MAX_QUESTIONS", 5))
    CHAT_WINDOW_HOURS = int(os.getenv("CHAT_WINDOW_HOURS", 24))
    CHAT_MAX_CHARS = int(os.getenv("CHAT_MAX_CHARS", 400))

    # Activar solo si el backend corre detrás de un proxy/balanceador de confianza.
    TRUST_PROXY = os.getenv("TRUST_PROXY", "0") == "1"
