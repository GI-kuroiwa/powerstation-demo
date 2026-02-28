"""Slack Webhook通知（例外検出時のみ）"""

import json
import logging
import urllib.request
import urllib.error

from src.config import SLACK_WEBHOOK_URL

log = logging.getLogger(__name__)


def notify_exceptions(job_id: str, exceptions: list[dict]) -> None:
    """例外行をBlock Kit形式でSlackに通知する。

    Args:
        job_id: ジョブID
        exceptions: 例外行のリスト。各dictに branch, invoice_no, diff_amount, reason_text を含む。
    """
    if not exceptions:
        return

    if not SLACK_WEBHOOK_URL:
        log.warning("SLACK_WEBHOOK_URL未設定のためSlack通知をスキップ")
        return

    blocks = [
        {
            "type": "header",
            "text": {"type": "plain_text", "text": f"請求検算AI: 例外 {len(exceptions)}件検出"},
        },
        {
            "type": "context",
            "elements": [{"type": "mrkdwn", "text": f"Job ID: `{job_id}`"}],
        },
        {"type": "divider"},
    ]

    for ex in exceptions:
        branch = ex.get("branch", "不明")
        invoice_no = ex.get("invoice_no", "-")
        customer = ex.get("customer_name", "-")
        diff = ex.get("diff_amount", 0)
        reason = ex.get("reason_text") or "理由未生成"
        blocks.append(
            {
                "type": "section",
                "fields": [
                    {"type": "mrkdwn", "text": f"*営業所:* {branch}"},
                    {"type": "mrkdwn", "text": f"*請求No:* {invoice_no}"},
                    {"type": "mrkdwn", "text": f"*顧客名:* {customer}"},
                    {"type": "mrkdwn", "text": f"*差額:* {diff:+,}円"},
                ],
            }
        )
        blocks.append(
            {
                "type": "context",
                "elements": [{"type": "mrkdwn", "text": f"_{reason}_"}],
            }
        )

    # Block Kit上限50ブロック対策: 超過時は件数のみ通知
    if len(blocks) > 50:
        blocks = blocks[:3]
        blocks.append(
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"例外が {len(exceptions)}件 検出されました。詳細はダッシュボードで確認してください。",
                },
            }
        )

    payload = json.dumps({"blocks": blocks}).encode("utf-8")
    req = urllib.request.Request(
        SLACK_WEBHOOK_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                log.info("Slack通知送信完了 (例外%d件)", len(exceptions))
            else:
                log.warning("Slack通知: HTTP %d", resp.status)
    except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
        log.warning("Slack通知失敗（処理は継続）: %s", e)
