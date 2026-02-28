"""FastAPIアプリ エントリーポイント"""

import logging
import signal
import sys
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from src.config import PORT, FRONTEND_URL, NODE_ENV
from src.db import init_schema
from src.routers import health, upload, stream, result, sample_csv, export

log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_schema()
    yield


app = FastAPI(
    title="PowerStation 請求検算AI",
    lifespan=lifespan,
    docs_url="/api/docs" if NODE_ENV == "development" else None,
    redoc_url=None,
)


# --- セキュリティヘッダーミドルウェア ---
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3847"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


# --- グローバル例外ハンドラ（スタックトレース隠蔽） ---
@app.exception_handler(Exception)
async def _global_exception_handler(request: Request, exc: Exception):
    log.exception("Unhandled error: %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(health.router)
app.include_router(upload.router)
app.include_router(stream.router)
app.include_router(result.router)
app.include_router(sample_csv.router)
app.include_router(export.router)


def _handle_sigterm(*_):
    sys.exit(0)


signal.signal(signal.SIGTERM, _handle_sigterm)

if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=PORT, reload=(NODE_ENV == "development"))
