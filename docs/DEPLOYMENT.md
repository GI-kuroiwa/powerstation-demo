# デプロイメント情報

## 本番URL

| サービス | URL | ブランド |
|---------|-----|---------|
| フロントエンド（PS版） | https://powerstation-demo.vercel.app | PowerStation AI |
| フロントエンド（汎用版） | https://financial-control-ai.vercel.app | 財務統制・経営可視化AIエージェント |
| バックエンドAPI | https://powerstation-demo.onrender.com | - |
| データベース | Neon PostgreSQL (us-west-2) | - |

## インフラ構成

| コンポーネント | プラットフォーム | プラン |
|--------------|----------------|-------|
| フロントエンド | Vercel | Hobby (無料) |
| バックエンド | Render.com | Free |
| データベース | Neon | Free Tier |

## フロントエンド (Vercel)

- **リポジトリ**: GI-kuroiwa/powerstation-demo
- **ブランチ**: main
- **Root Directory**: frontend
- **Framework**: Vite
- **環境変数**: VITE_API_BASE_URL, VITE_APP_TITLE

## フロントエンド汎用版 (Vercel)

- **プロジェクト名**: financial-control-ai
- **リポジトリ**: GI-kuroiwa/powerstation-demo（PS版と同一）
- **ブランチ**: main
- **Root Directory**: frontend
- **Framework**: Vite
- **環境変数**: VITE_APP_TITLEは未設定（デフォルト: 財務統制・経営可視化AIエージェント）

## バックエンド (Render.com)

- **サービスタイプ**: Web Service (Docker)
- **リポジトリ**: GI-kuroiwa/powerstation-demo
- **ブランチ**: main
- **Root Directory**: backend
- **Dockerfile**: ./Dockerfile
- **ヘルスチェック**: /api/health
- **環境変数**: DATABASE_URL, OPENAI_API_KEY, NODE_ENV, FRONTEND_URL, SLACK_WEBHOOK_URL

## 注意事項

- Render.com Freeプランは非アクティブ時にスリープし、初回アクセスに50秒以上かかる場合があります
- mainブランチへのpushで両サービスとも自動デプロイされます
