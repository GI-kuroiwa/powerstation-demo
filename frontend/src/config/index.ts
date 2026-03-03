// 環境変数の集約（import.meta.envはここでのみ参照）

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8291',
  appTitle: import.meta.env.VITE_APP_TITLE || '財務統制・経営可視化AIエージェント',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type Config = typeof config;
