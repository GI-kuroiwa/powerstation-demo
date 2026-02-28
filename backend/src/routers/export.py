"""GET /api/export/exceptions/{job_id}.csv — 例外CSVエクスポート"""

import csv
import io
import uuid as _uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from src.db import get_conn

router = APIRouter()

_COLUMNS = [
    "branch",
    "invoice_no",
    "customer_name",
    "diff_amount",
    "reason_code",
    "reason_text",
    "suggested_action",
]


@router.get("/api/export/exceptions/{job_id}.csv")
def export_exceptions(job_id: str):
    try:
        _uuid.UUID(job_id)
    except ValueError:
        raise HTTPException(400, "Invalid job_id format")
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT source_file_hash FROM jobs WHERE job_id = %s", (job_id,))
            job = cur.fetchone()
            if not job:
                raise HTTPException(404, "Job not found")
            cur.execute(
                "SELECT * FROM invoices WHERE source_file_hash = %s AND status = 'EXCEPTION' ORDER BY id",
                (job["source_file_hash"],),
            )
            rows = cur.fetchall()

    if not rows:
        raise HTTPException(404, "No exceptions found")

    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for r in rows:
        writer.writerow(dict(r))

    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="exceptions_{job_id}.csv"',
        },
    )
