import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MODEL_PATH: str = "models/swinir_4x.pth"
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "outputs"
    MAX_TILE_SIZE: int = 512
    MC_DROPOUT_PASSES: int = 5
    DEVICE: str = "cuda" if os.environ.get("USE_CUDA", "0") == "1" else "cpu"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

