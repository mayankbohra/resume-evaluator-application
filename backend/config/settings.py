from pydantic_settings import BaseSettings
from typing import List
import os
import json

class Settings(BaseSettings):
    openai_api_key: str
    gemini_api_key: str
    cors_origins: List[str] = ["*"]  # Default to allow all origins in case not specified
    env: str = os.getenv("ENV", "development")

    class Config:
        env_file = f".env.{os.getenv('ENV', 'development')}"

        @classmethod
        def parse_env_var(cls, field_name: str, raw_val: str):
            if field_name == 'cors_origins' and raw_val:
                try:
                    return json.loads(raw_val)
                except json.JSONDecodeError:
                    return raw_val.split(',')
            return raw_val

settings = Settings()
