import os
from typing import List
from pydantic_settings import BaseSettings

_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_DEFAULT_DB_PATH = os.path.join(_BACKEND_DIR, "dc_store.db")
_DEFAULT_UPLOAD_PATH = os.path.join(_BACKEND_DIR, "uploads")

class Settings(BaseSettings):
    PROJECT_NAME: str = "Jershiha Fashion"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "jershiha_fashion_super_secret_jwt_key_2026_xyz123")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: SQLite by default for zero-config local run, seamlessly switchable to PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{_DEFAULT_DB_PATH}")

    # Media storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", _DEFAULT_UPLOAD_PATH)
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

    # Boutique store profile & WhatsApp
    STORE_NAME: str = "Jershiha Fashion"
    STORE_TAGLINE: str = "Curated Women's Fashion & Ethnic Couture"
    STORE_WHATSAPP_NUMBER: str = os.getenv("STORE_WHATSAPP_NUMBER", "919876543210")
    STORE_PHONE: str = os.getenv("STORE_PHONE", "+91 98765 43210")
    STORE_EMAIL: str = os.getenv("STORE_EMAIL", "care@jershihafashion.com")
    STORE_ADDRESS: str = os.getenv("STORE_ADDRESS", "Thazheveettuvilakam, Puthiyathura, Pulluvila P.O. - 695526")
    STORE_HOURS: str = "Mon - Sun: 10:30 AM - 9:00 PM"
    STORE_MAPS_EMBED_URL: str = os.getenv("STORE_MAPS_EMBED_URL", "https://maps.google.com/maps?q=8.335898,77.046682&t=&z=16&ie=UTF8&iwloc=&output=embed")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

