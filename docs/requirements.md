# PowerStation 請求検算AI — 要件定義書

## 1. プロジェクト概要

### 1.1 目的
派遣業の請求検算を「電卓 → AI」に置換するデモシステム。
CSV投入 → 90件一括検算（30秒以内） → 例外7件を自動検出 → 理由生成 → Slack通知 → リアルタイムUI表示 → Sheets保存 → 監査ログ。

### 1.2 成功指標

| 指標 | 目標値 |
|------|--------|
| 処理速度 | 90件一括30秒以内 |
| 例外検出精度 | 100%（7/90） |
| 人的作業 | ゼロ（CSV投入→結果確認のみ） |
| 冪等性 | 100%（同一ファイル再投入で重複処理なし） |

### 1.3 定性的成功基準
- デモ視聴者が「電卓不要」と即座に理解できる
- 例外理由が非技術者にも読める自然文
- 営業所別サマリで管理者目線の価値を提示
- リアルタイム進捗で「AIが働いている」体感

---

## 2. システム全体像

### 2.1 アーキテクチャ

```
[CSV] → [React UI] → [FastAPI] → [PostgreSQL]
                           ├→ [OpenAI API]（例外理由生成）
                           ├→ [Google Sheets]（4シート保存）
                           └→ [Slack Webhook]（例外通知）
              ↑ SSE ↑
         [リアルタイム進捗]
```

### 2.2 ロール
- デモユーザー（認証なし・単一ロール）
- 承認者はデモ固定値: `demo_user`

### 2.3 ページ構成

| ID | ページ名 | ルート | 目的 |
|----|---------|-------|------|
| P-001 | 請求検算ダッシュボード | `/` | CSV投入→検算→結果確認を1画面で完結 |

---

## 3. ページ詳細仕様（P-001: 請求検算ダッシュボード）

### 3.1 画面レイアウト

```
┌─────────────────────────────────────────────────┐
│  PowerStation 請求検算AI                         │
├─────────────────────────────────────────────────┤
│  ┌──────────────────────┐                        │
│  │  CSV ドロップゾーン    │  [検算開始]             │
│  │  (drag & drop)       │  [サンプルCSV(90件)DL]  │
│  └──────────────────────┘                        │
│  ⚙処理ルール（折りたたみ）                        │
│                                                  │
│  ── リアルタイム進捗バー ──────────── 67/90 ──── │
│  ██████████████████░░░░░░░░  74%                 │
│  ✅ A営業所 30件完了  ⏳ B営業所 処理中...        │
│                                                  │
├──┬──────────┬──────────┬──────────┬──────────┤
│  │ 全体サマリ │営業所別  │ 例外一覧  │ 監査ログ  │
├──┴──────────┴──────────┴──────────┴──────────┤
│  (選択されたタブの内容)                           │
└─────────────────────────────────────────────────┘
```

### 3.2 上部エリア
- タイトル: "PowerStation 請求検算AI"
- CSVドラッグ&ドロップゾーン（ファイル選択も可、**単一ファイルのみ**）
  - 複数ファイル検知時: 即エラー表示（「1ファイルずつアップロードしてください」）、upload APIを呼ばない
- [検算開始] ボタン（CSV未選択時はdisabled）
- [サンプルCSV(90件)DL] ボタン → `GET /api/sample-csv?variant=demo`
- [リセット] ボタン（処理完了後に表示）
  - UI状態のみクリア（progress / result / selected file / job_id）
  - DB / Sheets / Slack は一切削除しない
  - 再実行は新 job_id で開始
- ⚙処理ルール（折りたたみ）: 税率10% / header税floor / ±0円 / 値引き優先順位 / 冪等UNIQUE

### 3.3 進捗エリア（SSE: `GET /api/stream/{job_id}`）
- プログレスバー: `processed / total`（パーセント表示）
- 営業所別ステータス: `✅ A営業所 30件完了 / ⏳ B営業所 処理中...`

### 3.4 タブ: 全体サマリ
| 表示項目 | 例 |
|---------|-----|
| 総件数 | 90 |
| 正常件数 | 83 |
| 例外件数 | 7 |
| 例外率 | 7.8% |
| 処理時間 | 12.3秒 |

### 3.5 タブ: 営業所別

| 列名 | 内容 |
|------|------|
| branch | 営業所名 |
| total | 件数 |
| exceptions | 例外件数 |
| top_reason_code | 最多reason_code |

### 3.6 タブ: 例外一覧

| 列名 | 内容 |
|------|------|
| invoice_no | 請求番号 |
| branch | 営業所 |
| customer_name | 取引先 |
| diff_amount | 差額（赤表示） |
| reason_text | AI生成理由文 |

**[例外CSVエクスポート] ボタン** → `GET /api/export/exceptions/{job_id}.csv`

**[内訳] 展開表示（アコーディオン）:**

| セクション | 項目 |
|-----------|------|
| 基幹値 | subtotal_ex_tax, tax_amount, total_in_tax |
| AI再計算 | net_subtotal, computed_tax, computed_total |
| 値引き情報 | applied_discount, discount_type (amount/rate/none) |

### 3.7 タブ: 監査ログ

| 列名 | 内容 |
|------|------|
| source_file_hash | ファイルハッシュ |
| invoice_no | 請求番号 |
| branch | 営業所 |
| status | OK / EXCEPTION |
| diff_amount | 差額 |
| reason_code | 例外コード |
| duplicate_skipped | 重複スキップ |
| approver | 承認者（固定: demo_user） |
| timestamp | 処理日時 |

---

## 4. 入力仕様（CSVスキーマ）

### 4.1 CSV形式
- 文字コード: UTF-8（BOM許可）
- 区切り: カンマ
- 1行目: ヘッダ必須

### 4.2 必須列

| 列名 | 型 | 説明 |
|------|-----|------|
| branch | string | 営業所名 |
| invoice_no | string | 請求番号（ユニークキー） |
| customer_name | string | 取引先名 |
| subtotal_ex_tax | number | 税抜小計（値引き前） |
| tax_amount | number | 基幹の消費税額 |
| total_in_tax | number | 基幹の税込合計 |

### 4.3 任意列

| 列名 | 型 | 説明 |
|------|-----|------|
| discount_amount | number | ヘッダ一括値引き金額（円） |
| discount_rate | number | 値引き率（例: 0.05） |
| tax_rate | number | 税率（デモは10%固定、10%以外は例外） |

### 4.4 branch空欄時の挙動
- ファイル名先頭プレフィクスから推定（例: `A_*.csv` → A営業所）
- 推定不能なら例外（reason_code=REQUIRED_MISSING）

### 4.5 数値正規化
- `"1,234"` / `"¥1,234"` / `"￥1,234"` → `1234`
- 全角数字 → 半角
- 空欄 → NULL（必須項目NULLは例外）
- 余分な空白・改行除去

---

## 5. 計算ルール

### 5.1 税率
- 固定: 10%（0.10）

### 5.2 値引き適用（優先順位 + 二重適用防止）

`applied_discount` の決定:
1. `discount_amount` が存在（NULLでない/0以上） → `applied_discount = discount_amount`
2. 上記以外で `discount_rate` が存在 → `applied_discount = floor(subtotal_ex_tax × discount_rate)`
3. 上記以外 → `applied_discount = 0`

**同時存在チェック:** `discount_amount` と `discount_rate` が両方入っていたら例外（reason_code=MULTI_DISCOUNT）

### 5.3 再計算（header税・切捨て）

```
net_subtotal   = subtotal_ex_tax - applied_discount
computed_tax   = floor(net_subtotal × 0.10)
computed_total = net_subtotal + computed_tax
```

### 5.4 差額判定（許容なし）

```
diff_amount = computed_total - total_in_tax
diff_amount == 0 → OK（緑）
diff_amount != 0 → 例外（赤）
```

### 5.5 tax_rate列の扱い
- `tax_rate` が存在し10%以外 → 例外（reason_code=TAXRATE_NOT_10）

---

## 6. 例外分類（reason_code）

### 6.1 reason_code一覧

| reason_code | 説明 |
|-------------|------|
| REQUIRED_MISSING | 必須項目欠落（NULL/欠列/branch推定不能） |
| MULTI_DISCOUNT | 値引き表現が複数（discount_amount と discount_rate 同時） |
| TAXRATE_NOT_10 | tax_rate が10%以外 |
| TAX_MISMATCH | tax_amount（基幹）と computed_tax の不一致 |
| DISCOUNT_MISMATCH | 値引き適用に起因する差額 |
| TOTAL_MISMATCH | 合計のみ不一致（上記に当てはまらない） |

### 6.2 reason_code決定ロジック（優先順）

1. 必須欠落 → `REQUIRED_MISSING`
2. 値引き重複 → `MULTI_DISCOUNT`
3. `tax_rate ≠ 10%` → `TAXRATE_NOT_10`
4. `tax_amount ≠ computed_tax` → `TAX_MISMATCH`
5. `applied_discount ≠ 0 AND diff_amount ≠ 0` → `DISCOUNT_MISMATCH`
6. それ以外 → `TOTAL_MISMATCH`

---

## 7. 冪等制御

- `source_file_hash` + `invoice_no` を UNIQUE 制約
- 再投入時: 計算スキップ、`duplicate_skipped = true`、監査ログに記録して処理継続

---

## 8. データ設計

### 8.1 jobs テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| job_id | UUID | PK |
| source_file_hash | VARCHAR | ファイルハッシュ |
| status | VARCHAR | queued / running / done / error |
| total_count | INT | 総件数 |
| processed_count | INT | 処理済み件数 |
| started_at | TIMESTAMP | 開始日時 |
| finished_at | TIMESTAMP | 完了日時 |
| error_message | TEXT | エラーメッセージ |

### 8.2 invoices テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | SERIAL | PK |
| job_id | UUID | FK → jobs |
| source_file_hash | VARCHAR | ファイルハッシュ |
| branch | VARCHAR | 営業所 |
| invoice_no | VARCHAR | 請求番号 |
| customer_name | VARCHAR | 取引先 |
| subtotal_ex_tax | INT | 税抜小計（値引き前） |
| discount_amount | INT | 一括値引き金額（NULL可） |
| discount_rate | DECIMAL | 値引き率（NULL可） |
| applied_discount | INT | 適用済み値引き額 |
| net_subtotal | INT | 値引き後税抜小計 |
| computed_tax | INT | AI再計算税額 |
| computed_total | INT | AI再計算税込合計 |
| base_tax | INT | 基幹税額（tax_amount） |
| base_total | INT | 基幹税込合計（total_in_tax） |
| diff_amount | INT | 差額 |
| status | VARCHAR | OK / EXCEPTION |
| reason_code | VARCHAR | 例外コード（NULL可） |
| reason_text | TEXT | AI生成理由文（例外のみ） |
| suggested_action | TEXT | AI生成推奨対応（例外のみ） |
| duplicate_skipped | BOOLEAN | 重複スキップフラグ |
| created_at | TIMESTAMP | 作成日時 |

**UNIQUE制約:** `(source_file_hash, invoice_no)`

---

## 9. API仕様

### 9.1 POST /api/upload
- Content-Type: `multipart/form-data`
- パラメータ: `file`（CSVファイル）
- 処理フロー:
  1. source_file_hash 生成
  2. jobs 作成（queued → running）
  3. CSVパース＆正規化
  4. 90件検算
  5. 冪等チェック: 重複はスキップして audit へ
  6. 例外のみ OpenAI で reason_text / suggested_action 生成
  7. DB保存（invoices）
  8. Sheets batch update（4シート）
  9. Slack通知（例外のみ）
- レスポンス: `{ "job_id": "UUID" }`

### 9.2 GET /api/stream/{job_id}
- Content-Type: `text/event-stream`（SSE）
- イベント:
  - `event: progress` → `{ "processed": 67, "total": 90, "percent": 74, "branch_status": {...} }`
  - `event: done` → `{ "job_id": "UUID" }`

### 9.3 GET /api/result/{job_id}
- レスポンス:
```json
{
  "summary": {
    "total": 90,
    "ok": 83,
    "exceptions": 7,
    "exception_rate": 7.8,
    "duration_sec": 12.3
  },
  "branch_summary": [...],
  "exceptions": [...],
  "audit_logs": [...]
}
```

### 9.4 GET /api/sample-csv?variant=demo
- 90件サンプルCSV返却（A:0例外 / B:2例外 / C:5例外）
- variant: `demo`（90件/例外7）, `clean`（90件/例外0）

### 9.5 GET /api/export/exceptions/{job_id}.csv
- 例外行のみCSVエクスポート
- 出力列: branch, invoice_no, customer_name, diff_amount, reason_code, reason_text, suggested_action
- Content-Disposition: `attachment; filename="exceptions_{job_id}.csv"`

### 9.6 POST /api/upload（複数ファイル防止）
- multipartで複数ファイル受信時: `400 Bad Request` + `{ "detail": "Only one CSV file is allowed." }`

### 9.7 GET /api/health
- ヘルスチェック

---

## 10. Google Sheets 仕様

### 10.1 シート構成

| シート名 | 用途 |
|---------|------|
| dashboard_summary | 全体サマリ |
| branch_summary | 営業所別サマリ |
| exceptions | 例外一覧 |
| audit_log | 監査ログ |

### 10.2 書込方針
- job_id 単位で追記
- 全行に job_id, created_at を先頭列として付与
- `values_batch_update` で4シートを1リクエスト

### 10.3 各シート列

**dashboard_summary:**
job_id, created_at, total, ok, exceptions, exception_rate, duration_sec

**branch_summary:**
job_id, created_at, branch, total, exceptions, top_reason_code

**exceptions:**
job_id, created_at, branch, invoice_no, customer_name, diff_amount, reason_code, reason_text, suggested_action

**audit_log:**
job_id, created_at, source_file_hash, invoice_no, branch, status, diff_amount, reason_code, duplicate_skipped, approver, timestamp

---

## 11. Slack 通知仕様

- 例外が1件以上あるときだけ送信
- Block Kit形式: 例外全件まとめて1回送信
- 内容: branch / invoice_no / diff_amount / reason_text
- Slack失敗時: UI/DB/Sheetsは継続（warningログのみ）

---

## 12. OpenAI API 仕様

### 12.1 対象
例外行のみ

### 12.2 入力データ

```
reason_code, 差額, 基幹合計, AI合計 をプロンプトに含める
```

### 12.3 呼び出し設定
- モデル: `gpt-4o-mini`
- temperature: 0.3
- 失敗時fallback: `"差額が発生しました。値引き・税・合計を確認してください。"`

---

## 13. デモデータ仕様

| 営業所 | 件数 | 例外 | 例外内容 |
|--------|------|------|----------|
| A営業所 | 30 | 0 | 全件一致 |
| B営業所 | 30 | 2 | 値引き率ズレ（DISCOUNT_MISMATCH） |
| C営業所 | 30 | 5 | 端数/税ズレ（TAX_MISMATCH / TOTAL_MISMATCH） |
| **合計** | **90** | **7** | |

---

## 14. 停止防止ルール

| 障害 | 対応 |
|------|------|
| 必須カラム欠落/不正値 | その行のみ例外化（REQUIRED_MISSING）して処理継続 |
| 同一ファイル再投入 | duplicate_skipped で継続 |
| OpenAI API失敗 | fallback文章で継続 |
| Google Sheets失敗 | DB保存を優先し継続（warningログ） |
| Slack失敗 | DB/Sheets/UIは継続（warningログ） |

---

## 15. セキュリティ要件

- ヘルスチェックエンドポイント: `/api/health`
- グレースフルシャットダウン: SIGTERM対応、8秒タイムアウト
- HTTPS強制（本番）
- 入力値サニタイゼーション
- CSVインジェクション対策（`=`, `+`, `-`, `@` 先頭の値をエスケープ）

---

## 16. 技術スタック

| レイヤー | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript 5 + MUI v6 + Vite 5 + React Router v6 |
| 状態管理 | Zustand + React Query |
| バックエンド | Python + FastAPI |
| ORM | Prisma (prisma-client-py) |
| データベース | PostgreSQL (Neon) |
| AI | OpenAI API (openai Python SDK) |
| Sheets | gspread + サービスアカウント |
| Slack | slack_sdk (Incoming Webhook) |
| フロントデプロイ | Vercel |
| バックデプロイ | Google Cloud Run |

---

## 17. 外部サービス一覧

| サービス | 用途 | 料金 |
|---------|------|------|
| OpenAI API | 例外理由文生成 | gpt-4o-mini使用 |
| Google Sheets API | 4シート保存 | 無料 |
| Slack Incoming Webhook | 例外通知 | 無料 |
| Neon PostgreSQL | データ永続化 | 無料枠（0.5GB） |
