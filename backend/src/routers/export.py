"""GET /api/export/exceptions/{job_id}.csv — 例外CSVエクスポート"""

import csv
import io

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
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT * FROM invoices WHERE job_id = %s AND status = 'EXCEPTION'" " ORDER BY id",
                (job_id,),
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
