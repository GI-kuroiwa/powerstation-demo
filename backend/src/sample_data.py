"""デモ用サンプルCSV生成（90件: A営業所0例外 / B営業所2例外 / C営業所5例外）"""

import io
import csv
import math

_HEADER = [
    "branch",
    "invoice_no",
    "customer_name",
    "subtotal_ex_tax",
    "tax_amount",
    "total_in_tax",
    "discount_amount",
    "discount_rate",
]


def generate_demo_csv() -> str:
    rows = []
    rows.extend(_branch_a())
    rows.extend(_branch_b())
    rows.extend(_branch_c())
    buf = io.StringIO()
    writer = csv.DictWriter(buf, fieldnames=_HEADER)
    writer.writeheader()
    writer.writerows(rows)
    return buf.getvalue()


def _ok_row(branch: str, idx: int, subtotal: int, d_amount=None, d_rate=None) -> dict:
    discount = d_amount or 0
    if d_rate and not d_amount:
        discount = math.floor(subtotal * d_rate)
    net = subtotal - discount
    tax = math.floor(net * 0.10)
    total = net + tax
    return {
        "branch": branch,
        "invoice_no": f"{branch[0]}-{idx:04d}",
        "customer_name": f"{branch}取引先{idx}",
        "subtotal_ex_tax": subtotal,
        "tax_amount": tax,
        "total_in_tax": total,
        "discount_amount": d_amount or "",
        "discount_rate": d_rate or "",
    }


def _branch_a() -> list:
    """A営業所: 30件、全件正常"""
    rows = []
    for i in range(1, 31):
        subtotal = 100000 + i * 3000
        rows.append(_ok_row("A営業所", i, subtotal))
    return rows


def _branch_b() -> list:
    """B営業所: 30件、2件例外（DISCOUNT_MISMATCH）"""
    rows = []
    for i in range(1, 31):
        subtotal = 80000 + i * 2500
        if i == 12:
            d_rate = 0.05
            net = subtotal - math.floor(subtotal * d_rate)
            tax = math.floor(net * 0.10)
            rows.append(
                {
                    "branch": "B営業所",
                    "invoice_no": f"B-{i:04d}",
                    "customer_name": f"B営業所取引先{i}",
                    "subtotal_ex_tax": subtotal,
                    "tax_amount": tax,
                    "total_in_tax": net + tax + 150,
                    "discount_amount": "",
                    "discount_rate": d_rate,
                }
            )
        elif i == 25:
            d_amount = 5000
            net = subtotal - d_amount
            tax = math.floor(net * 0.10)
            rows.append(
                {
                    "branch": "B営業所",
                    "invoice_no": f"B-{i:04d}",
                    "customer_name": f"B営業所取引先{i}",
                    "subtotal_ex_tax": subtotal,
                    "tax_amount": tax,
                    "total_in_tax": net + tax + 200,
                    "discount_amount": d_amount,
                    "discount_rate": "",
                }
            )
        elif i % 5 == 0:
            rows.append(_ok_row("B営業所", i, subtotal, d_rate=0.03))
        else:
            rows.append(_ok_row("B営業所", i, subtotal))
    return rows


def _branch_c() -> list:
    """C営業所: 30件、5件例外（TAX_MISMATCH x3, TOTAL_MISMATCH x2）"""
    rows = []
    tax_mismatch_idx = {7, 14, 21}
    total_mismatch_idx = {5, 28}
    for i in range(1, 31):
        subtotal = 120000 + i * 4000
        tax = math.floor(subtotal * 0.10)
        total = subtotal + tax
        if i in tax_mismatch_idx:
            rows.append(
                {
                    "branch": "C営業所",
                    "invoice_no": f"C-{i:04d}",
                    "customer_name": f"C営業所取引先{i}",
                    "subtotal_ex_tax": subtotal,
                    "tax_amount": tax + 1,
                    "total_in_tax": total + 1,
                    "discount_amount": "",
                    "discount_rate": "",
                }
            )
        elif i in total_mismatch_idx:
            rows.append(
                {
                    "branch": "C営業所",
                    "invoice_no": f"C-{i:04d}",
                    "customer_name": f"C営業所取引先{i}",
                    "subtotal_ex_tax": subtotal,
                    "tax_amount": tax,
                    "total_in_tax": total + 500,
                    "discount_amount": "",
                    "discount_rate": "",
                }
            )
        else:
            rows.append(_ok_row("C営業所", i, subtotal))
    return rows
