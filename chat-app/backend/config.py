import secrets
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/chatapp"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # LLM Configuration
    LLM_MODEL: str = "deepseek-chat"
    LLM_API_KEY: str = ""
    LLM_API_BASE: str = "https://api.deepseek.com/v1"

    class Config:
        env_file = ".env"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # 如果 SECRET_KEY 为空，生成一个强随机密钥（仅用于开发环境）
        # 生产环境必须通过环境变量设置
        if not self.SECRET_KEY:
            # 生成 64 字节的随机十六进制字符串（512 位）
            self.SECRET_KEY = secrets.token_hex(64)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
