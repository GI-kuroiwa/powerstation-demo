// @API_INTEGRATION - Agent 8でAPI接続実装済み
import { config } from '../../config';
import { API_PATHS } from '../../types';
import type { UploadResponse, ResultResponse, ProgressEvent } from '../../types';

const BASE = config.apiBaseUrl;

/** POST /api/upload - CSV投入 */
export async function uploadCsv(file: File): Promise<UploadResponse> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}${API_PATHS.upload}`, { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail ?? `Upload failed: ${res.status}`);
  }
  return res.json();
}

/** GET /api/result/{job_id} - 検算結果取得 */
export async function fetchResult(jobId: string): Promise<ResultResponse> {
  const res = await fetch(`${BASE}${API_PATHS.result(jobId)}`);
  if (!res.ok) throw new Error(`Result fetch failed: ${res.status}`);
  return res.json();
}

/** GET /api/sample-csv - サンプルCSVダウンロード */
export async function downloadSampleCsv(): Promise<Blob> {
  const res = await fetch(`${BASE}${API_PATHS.sampleCsv}`);
  if (!res.ok) throw new Error(`Sample CSV download failed: ${res.status}`);
  return res.blob();
}

/** GET /api/export/exceptions/{job_id}.csv - 例外CSVエクスポート */
export async function exportExceptionsCsv(jobId: string): Promise<Blob> {
  const res = await fetch(`${BASE}${API_PATHS.exportExceptions(jobId)}`);
  if (!res.ok) throw new Error(`Exception CSV export failed: ${res.status}`);
  return res.blob();
}

/** GET /api/stream/{job_id} - SSE進捗ストリーム接続 */
export function connectProgressStream(
  jobId: string,
  onProgress: (data: ProgressEvent) => void,
  onDone: () => void,
): EventSource {
  const es = new EventSource(`${BASE}${API_PATHS.stream(jobId)}`);
  es.addEventListener('progress', (e: MessageEvent) => {
    onProgress(JSON.parse(e.data));
  });
  es.addEventListener('done', () => {
    es.close();
    onDone();
  });
  es.onerror = () => {
    es.close();
    onDone();
  };
  return es;
}

/** GET /api/health - ヘルスチェック */
export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${BASE}${API_PATHS.health}`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}
