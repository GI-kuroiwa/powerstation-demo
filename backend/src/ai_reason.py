"""例外理由生成（OpenAI GPT-4o-mini）"""

from openai import OpenAI

client = OpenAI()


def generate_reason(data: dict) -> str:
    prompt = f"""
    以下は請求検算で差異が出たデータです。
    reason_code: {data['reason_code']}
    差額: {data['diff']}
    基幹合計: {data['base_total']}
    AI合計: {data['computed_total']}

    原因と次の対応を簡潔な日本語で出力してください。
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception:
        return "差額が発生しました。値引き・税・合計を確認してください。"
