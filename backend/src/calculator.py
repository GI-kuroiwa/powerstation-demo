"""検算エンジン（税・値引き・差額判定 + reason_code決定）

計算ルール（絶対変更禁止）:
  - 税率: 10%固定
  - 税計算: floor（切捨て）
  - 税計算粒度: header税（税抜小計に対して一発計算）
  - 差額許容: 0円のみOK（±1円も例外）
  - 値引き優先: discount_amount > discount_rate > line_amount（マイナス）
  - 二重適用防止: 複数方式同時 → 例外（MULTI_DISCOUNT）
"""

import math
from typing import Optional


TAX_RATE = 0.10


def calc_row(row: dict) -> dict:
    """1行分を検算し、結果dictを返す。"""
    subtotal = row["subtotal_ex_tax"]
    base_tax = row["tax_amount"]
    base_total = row["total_in_tax"]
    d_amount = row.get("discount_amount")
    d_rate = row.get("discount_rate")
    tax_rate = row.get("tax_rate")

    # --- 必須チェック ---
    missing = _check_required(row)
    if missing:
        return _exception_result(
            row,
            subtotal,
            base_tax,
            base_total,
            d_amount,
            d_rate,
            0,
            subtotal,
            0,
            0,
            0,
            "REQUIRED_MISSING",
        )

    # --- 二重値引きチェック ---
    if _both_discount(d_amount, d_rate):
        return _exception_result(
            row,
            subtotal,
            base_tax,
            base_total,
            d_amount,
            d_rate,
            0,
            subtotal,
            0,
            0,
            0,
            "MULTI_DISCOUNT",
        )

    # --- 税率チェック ---
    if tax_rate is not None and float(tax_rate) != TAX_RATE:
        return _exception_result(
            row,
            subtotal,
            base_tax,
            base_total,
            d_amount,
            d_rate,
            0,
            subtotal,
            0,
            0,
            0,
            "TAXRATE_NOT_10",
        )

    # --- 値引き適用 ---
    applied_discount = _calc_discount(subtotal, d_amount, d_rate)
    net_subtotal = subtotal - applied_discount
    computed_tax = math.floor(net_subtotal * TAX_RATE)
    computed_total = net_subtotal + computed_tax
    diff = computed_total - base_total

    # --- 差額判定 ---
    if diff == 0:
        return _ok_result(
            row,
            subtotal,
            base_tax,
            base_total,
            d_amount,
            d_rate,
            applied_discount,
            net_subtotal,
            computed_tax,
            computed_total,
            diff,
        )

    reason = _determine_reason(
        base_tax,
        computed_tax,
        applied_discount,
        diff,
    )
    return _exception_result(
        row,
        subtotal,
        base_tax,
        base_total,
        d_amount,
        d_rate,
        applied_discount,
        net_subtotal,
        computed_tax,
        computed_total,
        diff,
        reason,
    )


def _check_required(row: dict) -> Optional[str]:
    for key in ("branch", "invoice_no", "customer_name", "subtotal_ex_tax", "tax_amount", "total_in_tax"):
        if row.get(key) is None:
            return key
    return None


def _both_discount(d_amount, d_rate) -> bool:
    has_amount = d_amount is not None and d_amount > 0
    has_rate = d_rate is not None and d_rate > 0
    return has_amount and has_rate


def _calc_discount(subtotal: int, d_amount, d_rate) -> int:
    if d_amount is not None and d_amount > 0:
        return int(d_amount)
    if d_rate is not None and d_rate > 0:
        return math.floor(subtotal * float(d_rate))
    return 0


def _determine_reason(base_tax: int, computed_tax: int, applied_discount: int, diff: int) -> str:
    if base_tax != computed_tax:
        return "TAX_MISMATCH"
    if applied_discount != 0 and diff != 0:
        return "DISCOUNT_MISMATCH"
    return "TOTAL_MISMATCH"


def _base(
    row,
    subtotal,
    base_tax,
    base_total,
    d_amount,
    d_rate,
    applied_discount,
    net_subtotal,
    computed_tax,
    computed_total,
    diff,
):
    return {
        "branch": row.get("branch", ""),
        "invoice_no": row.get("invoice_no", ""),
        "customer_name": row.get("customer_name", ""),
        "subtotal_ex_tax": subtotal,
        "discount_amount": d_amount,
        "discount_rate": d_rate,
        "applied_discount": applied_discount,
        "net_subtotal": net_subtotal,
        "computed_tax": computed_tax,
        "computed_total": computed_total,
        "base_tax": base_tax,
        "base_total": base_total,
        "diff_amount": diff,
    }


def _ok_result(
    row,
    subtotal,
    base_tax,
    base_total,
    d_amount,
    d_rate,
    applied_discount,
    net_subtotal,
    computed_tax,
    computed_total,
    diff,
):
    r = _base(
        row,
        subtotal,
        base_tax,
        base_total,
        d_amount,
        d_rate,
        applied_discount,
        net_subtotal,
        computed_tax,
        computed_total,
        diff,
    )
    r["status"] = "OK"
    r["reason_code"] = None
    return r


def _exception_result(
    row,
    subtotal,
    base_tax,
    base_total,
    d_amount,
    d_rate,
    applied_discount,
    net_subtotal,
    computed_tax,
    computed_total,
    diff,
    reason_code,
):
    r = _base(
        row,
        subtotal,
        base_tax,
        base_total,
        d_amount,
        d_rate,
        applied_discount,
        net_subtotal,
        computed_tax,
        computed_total,
        diff,
    )
    r["status"] = "EXCEPTION"
    r["reason_code"] = reason_code
    return r
