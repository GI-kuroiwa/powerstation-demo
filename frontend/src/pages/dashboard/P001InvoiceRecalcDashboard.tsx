import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
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
import { useInvoiceRecalc } from '../../hooks/useInvoiceRecalc';

export const P001InvoiceRecalcDashboard = () => {
  const {
    file, setFile, phase, progress, result, error,
    start, reset, handleSampleDl, handleExportExceptions,
  } = useInvoiceRecalc();
  const [tab, setTab] = useState(0);

  const exceptions = useMemo(
    () => result?.exceptions ?? [],
    [result],
  );

  const showProgress = phase === 'uploading' || phase === 'running' || phase === 'done';
  const showResults = phase === 'done' && result;
  const isProcessing = phase === 'uploading' || phase === 'running';

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
            startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            disabled={!file || phase !== 'idle'}
            onClick={start}
            sx={{ fontWeight: 700 }}
          >
            {isProcessing ? '処理中...' : '検算開始'}
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
                onClick={reset}
              >
                リセット
              </Button>
            </>
          )}
        </Box>
      </Box>

      <ProcessingRules />

      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      {/* Progress */}
      {showProgress && (
        <ProgressSection
          processed={progress.processed}
          total={progress.total}
          percent={progress.percent}
          branchStatus={progress.branchStatus}
        />
      )}

      {/* Results */}
      {showResults && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="全体サマリ" />
              <Tab label="営業所別" />
              <Tab label="例外一覧" />
              <Tab label="監査ログ" />
            </Tabs>
          </Box>

          {tab === 0 && <SummaryTab summary={result.summary} />}
          {tab === 1 && <BranchTab branches={result.branch_summary} />}
          {tab === 2 && <ExceptionsTab exceptions={exceptions} />}
          {tab === 3 && <AuditLogTab invoices={result.audit_logs} />}
        </>
      )}
    </Box>
  );
};
