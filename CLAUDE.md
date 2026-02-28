# PowerStation 請求検算AI

## 基本原則
> 「シンプルさは究極の洗練である」

- **最小性**: 不要なコードは一文字も残さない。必要最小限を超えない
- **単一性**: 真実の源は常に一つ（型: types/index.ts、要件: requirements.md、進捗: SCOPE_PROGRESS.md）
- **刹那性**: 役目を終えたコード・ドキュメントは即座に削除する
- **実証性**: 推測しない。ログ・DB・APIレスポンスで事実を確認する
- **潔癖性**: エラーは隠さない。フォールバックで問題を隠蔽しない

## プロジェクト設定

技術スタック:
  frontend: React 18 + TypeScript 5 + MUI v6 + Vite 5 + React Router v6 + Zustand + React Query
  backend: Python + FastAPI + Prisma (prisma-client-py)
  database: PostgreSQL (Neon)

ポート設定:
  frontend: 3847
  backend: 8291

## テスト認証情報

開発用アカウント:
  email: test@powerstation.local
  password: Ps#demo2026!xK

## 環境変数

- frontend: frontend/.env.local（VITE_*プレフィックス必須）
  - 設定モジュール: src/config/index.ts（import.meta.env集約）
- backend: backend/.env.local（DATABASE_URL, ANTHROPIC_API_KEY, GOOGLE_SHEETS_CREDENTIALS_JSON, SLACK_WEBHOOK_URL等）
  - 設定モジュール: src/config/index.ts（process.env集約）
- ハードコード禁止: process.env / import.meta.env はconfig経由のみ
- **絶対禁止**: .env, .env.test, .env.development, .env.example は作成しない

## 命名規則

- コンポーネント: PascalCase.tsx / その他: camelCase.ts
- 変数・関数: camelCase / 定数: UPPER_SNAKE_CASE / 型: PascalCase
- Python: snake_case（PEP 8準拠）

## 型定義

- 単一真実源: frontend/src/types/index.ts
- backend/src/types/index.ts はフロントエンドからコピーして同期
- 変更時はフロントエンド → バックエンドの順序で更新

## コード品質

- 関数: 100行以下 / ファイル: 700行以下 / 複雑度: 10以下 / 行長: 120文字

## 開発ルール

### Prisma/DB
- エラー時はまず `npx prisma generate` を実行
- スキーマ変更は `npx prisma db push` のみ（migrate禁止）
- DB接続エラーは環境変数エラーとして即報告

### サーバー起動
- サーバーは1つのみ維持。別ポートでの重複起動禁止
- 起動前に既存プロセスを確認
- 環境変数変更時のみ再起動（Vite/Next.jsはホットリロードで環境変数を再読み込みしない）

### エラー対応
- 環境変数エラー → 全タスク停止、即報告（試行錯誤禁止）
- Prisma接続エラー → generate後1回だけ再試行
- 同じエラー3回 → Web検索で最新情報を収集

### デプロイ
- デプロイはユーザーの明示的な承認を得てから実行する
- 詳細: docs/DEPLOYMENT.md

### ドキュメント管理
許可されたドキュメントのみ作成可能:
- docs/SCOPE_PROGRESS.md（実装計画・進捗）
- docs/requirements.md（要件定義）
- docs/DEPLOYMENT.md（デプロイ情報）
- docs/e2e-specs/（E2Eテスト仕様書）
上記以外のドキュメント作成はユーザー許諾が必要。
実装済みの記載は積極的に削除する。

## Playwright

スクリーンショット保存先: /tmp/bluelamp-screenshots/

## 計算ルール（絶対変更禁止）

- 税率: 10%固定
- 税計算: floor（切捨て）
- 税計算粒度: header税（税抜小計に対して一発計算）
- 差額許容: 0円のみOK（±1円も例外）
- 値引き優先: discount_amount > discount_rate > line_amount（マイナス）
- 二重適用防止: 複数方式同時 → 例外（MULTI_DISCOUNT）

## 冪等制御

- source_file_hash + invoice_no で UNIQUE
- 重複 → スキップ + 監査ログ記録（停止しない）

## 停止防止

- 必須欠落 → 行例外化して継続
- Claude失敗 → fallback文で継続
- Sheets失敗 → DB優先して継続
- Slack失敗 → 他は継続（warning）

## ファイル投入制限

- 単一ファイルのみ許可
- Front: 複数ファイル検知時は即エラー表示、upload APIを呼ばない
- Back: multipartで複数受信したら 400 + "Only one CSV file is allowed."

## リセット仕様

- UI状態のみクリア（progress / result / selected file / job_id）
- DB / Sheets / Slack は一切削除しない
- 再実行は新 job_id で開始

## CI/CD設定

### GitHub Actions（PR時に自動実行）
| チェック | 対象 | コマンド |
|---------|------|---------|
| TypeScript | frontend | `npx tsc --noEmit` |
| Lint (JS/TS) | frontend | `npm run lint` |
| Build | frontend | `npm run build` |
| Lint (Python) | backend | `flake8 --max-line-length=120` |
| Format (Python) | backend | `black --check --line-length=120` |

### ブランチ戦略
- `main`: 本番環境
- `develop`: 開発統合ブランチ
- `feature/*`: 機能開発ブランチ

### リポジトリ
- URL: https://github.com/GI-kuroiwa/powerstation-demo
- 公開設定: Private
