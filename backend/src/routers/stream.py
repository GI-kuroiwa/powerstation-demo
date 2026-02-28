"""GET /api/stream/{job_id} — SSEリアルタイム進捗"""

import asyncio
import json

from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse

from src import progress

router = APIRouter()


@router.get("/api/stream/{job_id}")
async def stream(job_id: str):
    queue = progress.subscribe(job_id)

    async def _gen():
        while True:
            try:
                evt = await asyncio.wait_for(queue.get(), timeout=30.0)
            except asyncio.TimeoutError:
                yield {"event": "ping", "data": "{}"}
                continue

            if evt.get("event") == "done":
                yield {"event": "done", "data": json.dumps(evt)}
                break

            yield {"event": "progress", "data": json.dumps(evt)}

    return EventSourceResponse(_gen())
