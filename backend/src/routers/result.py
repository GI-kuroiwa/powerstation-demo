"""GET /api/result/{job_id} — 検算結果取得"""

from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from src.db import get_conn

router = APIRouter()


@router.get("/api/result/{job_id}")
def result(job_id: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM jobs WHERE job_id = %s", (job_id,))
            job = cur.fetchone()
            if not job:
                raise HTTPException(404, "Job not found")

            cur.execute(
                "SELECT * FROM invoices WHERE job_id = %s ORDER BY id",
                (job_id,),
            )
            invoices = cur.fetchall()

    all_rows = [_clean(dict(r)) for r in invoices]
    exceptions = [r for r in all_rows if r["status"] == "EXCEPTION"]
    ok_count = sum(1 for r in all_rows if r["status"] == "OK")
    total = len(all_rows)
    exc_count = len(exceptions)

    started = job["started_at"]
    finished = job["finished_at"]
    duration = 0.0
    if started and finished:
        duration = round((finished - started).total_seconds(), 1)

    exc_rate = round(exc_count / total * 100, 1) if total else 0.0

    branch_map: dict = {}
    for r in all_rows:
        b = r["branch"]
        if b not in branch_map:
            branch_map[b] = {"branch": b, "total": 0, "exceptions": 0, "reasons": {}}
        branch_map[b]["total"] += 1
        if r["status"] == "EXCEPTION":
            branch_map[b]["exceptions"] += 1
            rc = r["reason_code"]
            if rc:
                branch_map[b]["reasons"][rc] = branch_map[b]["reasons"].get(rc, 0) + 1

    branch_summary = []
    for b in branch_map.values():
        reasons = b.pop("reasons")
        top = max(reasons, key=reasons.get) if reasons else None
        b["top_reason_code"] = top
        branch_summary.append(b)

    return JSONResponse(
        {
            "summary": {
                "total": total,
                "ok": ok_count,
                "exceptions": exc_count,
                "exception_rate": exc_rate,
                "duration_sec": duration,
            },
            "branch_summary": branch_summary,
            "exceptions": exceptions,
            "audit_logs": all_rows,
        }
    )


def _clean(row: dict) -> dict:
    out = {}
    for k, v in row.items():
        if isinstance(v, datetime):
            out[k] = v.isoformat()
        elif isinstance(v, Decimal):
            out[k] = float(v)
        else:
            out[k] = v
    return out
