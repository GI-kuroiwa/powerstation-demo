// @API_INTEGRATION - Agent 8でAPI接続時に実装
import type { UploadResponse, ResultResponse } from '../../types';

/** POST /api/upload - CSV投入 */
export async function uploadCsv(_file: File): Promise<UploadResponse> {
  throw new Error('API not implemented');
}

/** GET /api/result/{job_id} - 検算結果取得 */
export async function fetchResult(_jobId: string): Promise<ResultResponse> {
  throw new Error('API not implemented');
}

/** GET /api/sample-csv?variant=demo - サンプルCSVダウンロード */
export async function downloadSampleCsv(_variant: string = 'demo'): Promise<Blob> {
  throw new Error('API not implemented');
}

/** GET /api/export/exceptions/{job_id}.csv - 例外CSVエクスポート */
export async function exportExceptionsCsv(_jobId: string): Promise<Blob> {
  throw new Error('API not implemented');
}

/** GET /api/stream/{job_id} - SSE進捗ストリーム接続 */
export function connectProgressStream(_jobId: string, _onEvent: (data: unknown) => void): void {
  throw new Error('API not implemented');
}

/** GET /api/health - ヘルスチェック */
export async function healthCheck(): Promise<{ status: string }> {
  throw new Error('API not implemented');
}
