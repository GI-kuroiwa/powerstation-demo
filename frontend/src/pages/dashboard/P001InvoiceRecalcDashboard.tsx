import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { CsvDropZone } from './CsvDropZone';
import { ProcessingRules } from './ProcessingRules';
import { ProgressSection } from './ProgressSection';
import { SummaryTab } from './SummaryTab';
import { BranchTab } from './BranchTab';
import { ExceptionsTab } from './ExceptionsTab';
import { AuditLogTab } from './AuditLogTab';
import { AccountingLinkMockTab } from '../../tabs/AccountingLinkMockTab';
import { BiAnalyticsMockTab } from '../../tabs/BiAnalyticsMockTab';
import { useInvoiceRecalc } from '../../hooks/useInvoiceRecalc';
import { derivedMetrics } from '../../utils/derivedMetrics';

export const P001InvoiceRecalcDashboard = () => {
  const {
    file, setFile, phase, progress, result, error,
    start, reset, handleExportExceptions,
  } = useInvoiceRecalc();
  const [tab, setTab] = useState(0);

  const exceptions = useMemo(
    () => result?.exceptions ?? [],
    [result],
  );

  const metrics = useMemo(
    () => derivedMetrics(result?.audit_logs ?? []),
    [result],
  );

  const showProgress = phase === 'uploading' || phase === 'running' || phase === 'done';
  const showResults = phase === 'done' && result;
  const isProcessing = phase === 'uploading' || phase === 'running';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Upper area: CSV drop + center button */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <CsvDropZone file={file} onFileSelect={setFile} disabled={phase !== 'idle'} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained" color="secondary" size="large"
            startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            disabled={!file || phase !== 'idle'}
            onClick={start}
            sx={{ fontWeight: 700, px: 5 }}
          >
            {isProcessing ? '処理中...' : '検算開始'}
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

      {/* Tabs - 常時表示 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="BI分析AI" />
          <Tab label="全体サマリ" />
          <Tab label="営業所別" />
          <Tab label="例外一覧" />
          <Tab label="監査ログ" />
          <Tab label="会計連携AI" />
        </Tabs>
      </Box>

      {/* Tab contents */}
      {tab === 0 && <BiAnalyticsMockTab metrics={metrics} />}
      {tab >= 1 && tab <= 4 && (
        showResults ? (
          <>
            {tab === 1 && <SummaryTab summary={result.summary} />}
            {tab === 2 && <BranchTab branches={result.branch_summary} />}
            {tab === 3 && <ExceptionsTab exceptions={exceptions} />}
            {tab === 4 && <AuditLogTab invoices={result.audit_logs} />}
          </>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              検算を実行すると結果が表示されます。
            </Typography>
          </Box>
        )
      )}
      {tab === 5 && <AccountingLinkMockTab metrics={metrics} />}
    </Box>
  );
};
