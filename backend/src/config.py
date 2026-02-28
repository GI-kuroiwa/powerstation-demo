"""環境変数の集約（os.environはここでのみ参照）"""

import os
from pathlib import Path

from dotenv import load_dotenv

# .env.localを読み込み
env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)


class Config:
    PORT: int = int(os.environ.get("PORT", "8291"))
    DATABASE_URL: str = os.environ.get("DATABASE_URL", "")
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "")
    SESSION_SECRET: str = os.environ.get("SESSION_SECRET", "")
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3847")
    NODE_ENV: str = os.environ.get("NODE_ENV", "development")
    ANTHROPIC_API_KEY: str = os.environ.get("ANTHROPIC_API_KEY", "")
    GOOGLE_SHEETS_CREDENTIALS_JSON: str = os.environ.get("GOOGLE_SHEETS_CREDENTIALS_JSON", "")
    SLACK_WEBHOOK_URL: str = os.environ.get("SLACK_WEBHOOK_URL", "")

    @property
    def is_dev(self) -> bool:
        return self.NODE_ENV == "development"

    @property
    def is_prod(self) -> bool:
        return self.NODE_ENV == "production"


config = Config()
