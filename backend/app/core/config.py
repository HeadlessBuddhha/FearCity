from functools import lru_cache
from typing import Optional

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_key: str = Field(default="", env="SUPABASE_SERVICE_ROLE_KEY")
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:8080,http://127.0.0.1:5500,http://127.0.0.1:8080",
        env="ALLOWED_ORIGINS",
    )
    jwt_secret: str = Field(default="", env="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", env="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=1440, env="JWT_EXPIRE_MINUTES")
    dev_access_key: Optional[str] = Field(default=None, env="DEV_ACCESS_KEY")

    @property
    def origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
