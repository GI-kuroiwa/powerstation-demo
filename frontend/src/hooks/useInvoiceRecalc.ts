import { useState, useCallback, useRef } from 'react';
import type { ResultResponse, ProgressEvent, BranchStatus } from '../types';
import { uploadCsv, fetchResult, connectProgressStream, downloadSampleCsv, exportExceptionsCsv } from '../services/api/invoiceRecalc';

type Phase = 'idle' | 'uploading' | 'running' | 'done' | 'error';

interface Progress {
  processed: number;
  total: number;
  percent: number;
  branchStatus: BranchStatus;
}

export function useInvoiceRecalc() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress>({ processed: 0, total: 0, percent: 0, branchStatus: {} });
  const [result, setResult] = useState<ResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  const start = useCallback(async () => {
    if (!file) return;
    setError(null);
    setPhase('uploading');
    try {
      const { job_id } = await uploadCsv(file);
      setJobId(job_id);
      setPhase('running');

      esRef.current = connectProgressStream(
        job_id,
        (evt: ProgressEvent) => {
          setProgress({ processed: evt.processed, total: evt.total, percent: evt.percent, branchStatus: evt.branch_status });
        },
        async () => {
          try {
            const res = await fetchResult(job_id);
            setResult(res);
            setPhase('done');
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setPhase('error');
          }
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase('error');
    }
  }, [file]);

  const reset = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setFile(null);
    setPhase('idle');
    setJobId(null);
    setProgress({ processed: 0, total: 0, percent: 0, branchStatus: {} });
    setResult(null);
    setError(null);
  }, []);

  const handleSampleDl = useCallback(async () => {
    const blob = await downloadSampleCsv();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_90.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportExceptions = useCallback(async () => {
    if (!jobId) return;
    const blob = await exportExceptionsCsv(jobId);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exceptions_${jobId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jobId]);

  return {
    file, setFile, phase, progress, result, error, jobId,
    start, reset, handleSampleDl, handleExportExceptions,
  };
}
