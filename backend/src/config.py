"""環境変数の集約（os.environはここでのみ参照）"""

import os
from pathlib import Path

from dotenv import load_dotenv

# .env.localを読み込み
env_path = Path(__file__).resolve().parent.parent / ".env.local"
load_dotenv(env_path)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not set")

if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("OPENAI_API_KEY not set")

PORT: int = int(os.environ.get("PORT", "8291"))
JWT_SECRET: str = os.environ.get("JWT_SECRET", "")
SESSION_SECRET: str = os.environ.get("SESSION_SECRET", "")
FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3847")
NODE_ENV: str = os.environ.get("NODE_ENV", "development")
OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "")
GOOGLE_SHEETS_CREDENTIALS_JSON: str = os.environ.get("GOOGLE_SHEETS_CREDENTIALS_JSON", "")
SLACK_WEBHOOK_URL: str = os.environ.get("SLACK_WEBHOOK_URL", "")
