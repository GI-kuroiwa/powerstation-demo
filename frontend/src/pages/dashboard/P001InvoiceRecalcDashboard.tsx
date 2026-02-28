import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { CsvDropZone } from './CsvDropZone';
import { ProcessingRules } from './ProcessingRules';
import { ProgressSection } from './ProgressSection';
import { SummaryTab } from './SummaryTab';
import { BranchTab } from './BranchTab';
import { ExceptionsTab } from './ExceptionsTab';
import { AuditLogTab } from './AuditLogTab';
import {
  buildMockInvoices,
  buildMockSummary,
  buildMockBranchSummary,
  buildMockBranchStatus,
} from '../../mocks/dashboardMock';

type Phase = 'idle' | 'running' | 'done';

export const P001InvoiceRecalcDashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [tab, setTab] = useState(0);

  const invoices = useMemo(() => buildMockInvoices(), []);
  const summary = useMemo(() => buildMockSummary(), []);
  const branches = useMemo(() => buildMockBranchSummary(), []);
  const branchStatus = useMemo(() => buildMockBranchStatus(), []);
  const exceptions = useMemo(() => invoices.filter((i) => i.status === 'EXCEPTION'), [invoices]);

  const handleStart = useCallback(() => {
    setPhase('running');
    setTimeout(() => setPhase('done'), 2000);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setPhase('idle');
    setTab(0);
  }, []);

  const handleSampleDl = useCallback(() => {
    const blob = new Blob(['sample CSV content'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_90.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportExceptions = useCallback(() => {
    const header = 'invoice_no,branch,customer_name,diff_amount,reason_code,reason_text,suggested_action\n';
    const rows = exceptions.map((e) =>
      [e.invoice_no, e.branch, e.customer_name, e.diff_amount, e.reason_code, e.reason_text, e.suggested_action]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exceptions_mock.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [exceptions]);

  const showResults = phase === 'running' || phase === 'done';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Upper area: CSV drop + buttons */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 400px', minWidth: 300 }}>
          <CsvDropZone file={file} onFileSelect={setFile} disabled={phase !== 'idle'} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 180 }}>
          <Button
            variant="contained" color="secondary" size="large"
            startIcon={<PlayArrowIcon />}
            disabled={!file || phase !== 'idle'}
            onClick={handleStart}
            sx={{ fontWeight: 700 }}
          >
            検算開始
          </Button>
          <Button
            variant="outlined" size="small"
            startIcon={<DownloadIcon />}
            onClick={handleSampleDl}
          >
            サンプルCSV(90件)DL
          </Button>
          {phase === 'done' && (
            <>
              <Button
                variant="outlined" color="error" size="small"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportExceptions}
              >
                例外CSVエクスポート
              </Button>
              <Button
                variant="outlined" size="small"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
              >
                リセット
              </Button>
            </>
          )}
        </Box>
      </Box>

      <ProcessingRules />

      {/* Progress + Results */}
      {showResults && (
        <>
          <ProgressSection
            processed={phase === 'done' ? 90 : 67}
            total={90}
            percent={phase === 'done' ? 100 : 74}
            branchStatus={branchStatus}
          />

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="全体サマリ" />
              <Tab label="営業所別" />
              <Tab label="例外一覧" />
              <Tab label="監査ログ" />
            </Tabs>
          </Box>

          {tab === 0 && <SummaryTab summary={summary} />}
          {tab === 1 && <BranchTab branches={branches} />}
          {tab === 2 && <ExceptionsTab exceptions={exceptions} />}
          {tab === 3 && <AuditLogTab invoices={invoices} />}
        </>
      )}
    </Box>
  );
};
