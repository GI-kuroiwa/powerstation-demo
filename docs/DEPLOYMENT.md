# デプロイメント情報

## 本番URL

| サービス | URL |
|---------|-----|
| フロントエンド | https://powerstation-demo.vercel.app |
| バックエンドAPI | https://powerstation-demo.onrender.com |
| データベース | Neon PostgreSQL (us-west-2) |

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
- **環境変数**: VITE_API_BASE_URL

## バックエンド (Render.com)

- **サービスタイプ**: Web Service (Docker)
- **リポジトリ**: GI-kuroiwa/powerstation-demo
- **ブランチ**: main
- **Root Directory**: backend
- **Dockerfile**: ./Dockerfile
- **ヘルスチェック**: /api/health
- **環境変数**: DATABASE_URL, OPENAI_API_KEY, NODE_ENV, FRONTEND_URL

## 注意事項

- Render.com Freeプランは非アクティブ時にスリープし、初回アクセスに50秒以上かかる場合があります
- mainブランチへのpushで両サービスとも自動デプロイされます
