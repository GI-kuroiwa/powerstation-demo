"""SSE進捗管理（インメモリpub/sub）"""

import asyncio
from typing import Dict, List


_queues: Dict[str, List[asyncio.Queue]] = {}


def subscribe(job_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _queues.setdefault(job_id, []).append(q)
    return q


async def publish(job_id: str, event: dict):
    for q in _queues.get(job_id, []):
        await q.put(event)


def cleanup(job_id: str):
    _queues.pop(job_id, None)
