"""CSVパース＆数値正規化"""

import csv
import io
import re
from typing import List, Optional


_NUM_RE = re.compile(r"[¥￥,\s]")
_ZEN_DIGITS = str.maketrans("０１２３４５６７８９", "0123456789")
_CSV_INJECT = re.compile(r"^[=+\-@]")


def parse_csv(text: str) -> List[dict]:
    """UTF-8 CSVテキストをパースし、正規化済みdictリストを返す。"""
    text = text.lstrip("\ufeff")
    reader = csv.DictReader(io.StringIO(text))
    rows = []
    for raw in reader:
        rows.append(_normalize_row(raw))
    return rows


def _normalize_row(raw: dict) -> dict:
    row = {}
    for key, val in raw.items():
        k = key.strip()
        v = val.strip() if val else ""
        row[k] = v
    return {
        "branch": _safe_str(row.get("branch")),
        "invoice_no": _safe_str(row.get("invoice_no")),
        "customer_name": _safe_str(row.get("customer_name")),
        "subtotal_ex_tax": _to_int(row.get("subtotal_ex_tax")),
        "tax_amount": _to_int(row.get("tax_amount")),
        "total_in_tax": _to_int(row.get("total_in_tax")),
        "discount_amount": _to_int_optional(row.get("discount_amount")),
        "discount_rate": _to_float_optional(row.get("discount_rate")),
        "tax_rate": _to_float_optional(row.get("tax_rate")),
    }


def _safe_str(val: Optional[str]) -> Optional[str]:
    if not val:
        return None
    val = val.translate(_ZEN_DIGITS).strip()
    if _CSV_INJECT.match(val):
        val = "'" + val
    return val if val else None


def _to_int(val: Optional[str]) -> Optional[int]:
    if not val:
        return None
    cleaned = _NUM_RE.sub("", val.translate(_ZEN_DIGITS))
    if not cleaned:
        return None
    return int(float(cleaned))


def _to_int_optional(val: Optional[str]) -> Optional[int]:
    if not val:
        return None
    cleaned = _NUM_RE.sub("", val.translate(_ZEN_DIGITS))
    if not cleaned:
        return None
    n = int(float(cleaned))
    return n if n != 0 else None


def _to_float_optional(val: Optional[str]) -> Optional[float]:
    if not val:
        return None
    cleaned = _NUM_RE.sub("", val.translate(_ZEN_DIGITS))
    if not cleaned:
        return None
    f = float(cleaned)
    return f if f != 0.0 else None
