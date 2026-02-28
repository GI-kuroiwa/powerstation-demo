// === Job ===
export type JobStatus = 'queued' | 'running' | 'done' | 'error';

export interface Job {
  job_id: string;
  source_file_hash: string;
  status: JobStatus;
  total_count: number;
  processed_count: number;
  started_at: string | null;
  finished_at: string | null;
  error_message: string | null;
}

// === Invoice ===
export type InvoiceStatus = 'OK' | 'EXCEPTION';

export type ReasonCode =
  | 'REQUIRED_MISSING'
  | 'MULTI_DISCOUNT'
  | 'TAXRATE_NOT_10'
  | 'TAX_MISMATCH'
  | 'DISCOUNT_MISMATCH'
  | 'TOTAL_MISMATCH';

export interface Invoice {
  id: number;
  job_id: string;
  source_file_hash: string;
  branch: string;
  invoice_no: string;
  customer_name: string;
  subtotal_ex_tax: number;
  discount_amount: number | null;
  discount_rate: number | null;
  applied_discount: number;
  net_subtotal: number;
  computed_tax: number;
  computed_total: number;
  base_tax: number;
  base_total: number;
  diff_amount: number;
  status: InvoiceStatus;
  reason_code: ReasonCode | null;
  reason_text: string | null;
  suggested_action: string | null;
  duplicate_skipped: boolean;
  created_at: string;
}

// === API Response ===
export interface Summary {
  total: number;
  ok: number;
  exceptions: number;
  exception_rate: number;
  duration_sec: number;
}

export interface BranchSummary {
  branch: string;
  total: number;
  exceptions: number;
  top_reason_code: ReasonCode | null;
}

export interface ResultResponse {
  summary: Summary;
  branch_summary: BranchSummary[];
  exceptions: Invoice[];
  audit_logs: Invoice[];
}

// === SSE Progress ===
export interface BranchStatus {
  [branch: string]: {
    total: number;
    processed: number;
    status: 'pending' | 'processing' | 'done';
  };
}

export interface ProgressEvent {
  processed: number;
  total: number;
  percent: number;
  branch_status: BranchStatus;
}

// === Upload ===
export interface UploadResponse {
  job_id: string;
}

// === API Paths ===
export const API_PATHS = {
  upload: '/api/upload',
  stream: (jobId: string) => `/api/stream/${jobId}`,
  result: (jobId: string) => `/api/result/${jobId}`,
  sampleCsv: '/api/sample-csv',
  exportExceptions: (jobId: string) => `/api/export/exceptions/${jobId}.csv`,
  health: '/api/health',
} as const;
