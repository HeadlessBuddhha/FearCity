from pydantic import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str = "http://localhost"
    supabase_service_key: str = "placeholder"
    allowed_origins: str = "http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500,http://127.0.0.1:8080"
    jwt_secret: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    # Chave local para dev (sem Supabase)
    dev_access_key: str = "CHAVE_SECRETA_2024"

    @property
    def origins_list(self):
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
