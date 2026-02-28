"""POST /api/upload — CSVアップロード→検算→DB書込"""

import asyncio
import hashlib
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, File, HTTPException, UploadFile

from src.ai_reason import generate_reason
from src.calculator import calc_row
from src.csv_parser import parse_csv
from src.db import get_conn
from src import progress

router = APIRouter()
log = logging.getLogger(__name__)

_INSERT_SQL = """INSERT INTO invoices (
    job_id, source_file_hash, branch, invoice_no,
    customer_name, subtotal_ex_tax, discount_amount,
    discount_rate, applied_discount, net_subtotal,
    computed_tax, computed_total, base_tax, base_total,
    diff_amount, status, reason_code, reason_text,
    suggested_action, duplicate_skipped
) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
ON CONFLICT (source_file_hash, invoice_no) DO NOTHING"""


@router.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "CSVファイルのみ対応しています")

    raw = await file.read()
    text = raw.decode("utf-8-sig")
    file_hash = hashlib.sha256(raw).hexdigest()
    rows = parse_csv(text)
    if not rows:
        raise HTTPException(400, "CSVが空です")

    job_id = str(uuid.uuid4())

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO jobs (job_id, source_file_hash, status, total_count)" " VALUES (%s, %s, 'queued', %s)",
                (job_id, file_hash, len(rows)),
            )
        conn.commit()

    asyncio.create_task(_process(job_id, file_hash, rows))
    return {"job_id": job_id}


async def _process(job_id: str, file_hash: str, rows: list):
    loop = asyncio.get_event_loop()
    started = datetime.now(timezone.utc)

    try:
        await loop.run_in_executor(
            None,
            _run_sync,
            job_id,
            file_hash,
            rows,
            started,
        )
    except Exception as e:
        log.exception("Processing failed for job %s", job_id)
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE jobs SET status='error', error_message=%s," " finished_at=%s WHERE job_id=%s",
                    (str(e), datetime.now(timezone.utc), job_id),
                )
            conn.commit()
        await progress.publish(job_id, {"event": "done", "job_id": job_id})
        progress.cleanup(job_id)


def _run_sync(job_id: str, file_hash: str, rows: list, started):
    """同期処理（スレッドプール内で実行）"""
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE jobs SET status='running', started_at=%s WHERE job_id=%s",
            (started, job_id),
        )
        conn.commit()

        branch_map: dict = {}
        for r in rows:
            b = r.get("branch") or "不明"
            branch_map.setdefault(b, {"total": 0, "processed": 0, "status": "pending"})
            branch_map[b]["total"] += 1

        total = len(rows)

        for i, row in enumerate(rows):
            branch = row.get("branch") or "不明"
            if branch_map[branch]["status"] == "pending":
                branch_map[branch]["status"] = "processing"

            result = calc_row(row)

            reason_text = None
            suggested_action = None

            if result["status"] == "EXCEPTION":
                reason_text, suggested_action = _gen_reason(result)

            _insert_invoice(cur, conn, job_id, file_hash, result, reason_text, suggested_action)

            processed = i + 1
            branch_map[branch]["processed"] += 1
            if branch_map[branch]["processed"] >= branch_map[branch]["total"]:
                branch_map[branch]["status"] = "done"

            cur.execute(
                "UPDATE jobs SET processed_count=%s WHERE job_id=%s",
                (processed, job_id),
            )
            conn.commit()

            _publish_sync(
                job_id,
                {
                    "processed": processed,
                    "total": total,
                    "percent": round(processed / total * 100),
                    "branch_status": {k: dict(v) for k, v in branch_map.items()},
                },
            )

        finished = datetime.now(timezone.utc)
        cur.execute(
            "UPDATE jobs SET status='done', finished_at=%s WHERE job_id=%s",
            (finished, job_id),
        )
        conn.commit()
        cur.close()

        _publish_sync(job_id, {"event": "done", "job_id": job_id})
        import time

        time.sleep(0.5)
        progress.cleanup(job_id)
    finally:
        conn.close()


def _gen_reason(result: dict) -> tuple:
    data = {
        "reason_code": result["reason_code"],
        "diff": result["diff_amount"],
        "base_total": result["base_total"],
        "computed_total": result["computed_total"],
    }
    try:
        text = generate_reason(data)
    except Exception:
        text = "差額が発生しました。値引き・税・合計を確認してください。"
    action = "差額を確認し、基幹システムの値を修正してください。"
    return text, action


def _insert_invoice(cur, conn, job_id, file_hash, result, reason_text, suggested_action):
    params = (
        job_id,
        file_hash,
        result["branch"],
        result["invoice_no"],
        result["customer_name"],
        result["subtotal_ex_tax"],
        result["discount_amount"],
        result["discount_rate"],
        result["applied_discount"],
        result["net_subtotal"],
        result["computed_tax"],
        result["computed_total"],
        result["base_tax"],
        result["base_total"],
        result["diff_amount"],
        result["status"],
        result["reason_code"],
        reason_text,
        suggested_action,
        False,
    )
    cur.execute(_INSERT_SQL, params)
    conn.commit()


def _publish_sync(job_id: str, event: dict):
    import asyncio as _aio

    try:
        loop = _aio.get_event_loop()
        if loop.is_running():
            _aio.run_coroutine_threadsafe(
                progress.publish(job_id, event),
                loop,
            )
    except RuntimeError:
        pass
