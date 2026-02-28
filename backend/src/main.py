"""FastAPIアプリ エントリーポイント"""

import signal
import sys
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import PORT, FRONTEND_URL
from src.db import init_schema
from src.routers import health, upload, stream, result, sample_csv, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_schema()
    yield


app = FastAPI(title="PowerStation 請求検算AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3847"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    uvicorn.run("src.main:app", host="0.0.0.0", port=PORT, reload=True)
