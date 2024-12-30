from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    openai_api_key: str
    gemini_api_key: str
    cors_origins: List[str]
    env: str = os.getenv("ENV", "development")

    class Config:
        env_file = f".env.{os.getenv('ENV', 'development')}"

settings = Settings()
