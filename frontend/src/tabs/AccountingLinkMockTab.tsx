import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SyncIcon from '@mui/icons-material/Sync';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import type { DerivedMetrics, JournalPreviewRow } from '../utils/derivedMetrics';

interface Props {
  metrics: DerivedMetrics;
}

// ── ダミーデータ（検算未実行時） ──
const DUMMY_KPI = { okCount: 5832, exceptionCount: 247, automationRate: 0.959 };
const DUMMY_JOURNAL: JournalPreviewRow[] = [
  { invoiceNo: 'INV-2026-0012', branch: '東京本社', customerName: '東京電力EP', netSubtotal: 1284500, computedTax: 128450, computedTotal: 1412950, confidence: 0.98 },
  { invoiceNo: 'INV-2026-0034', branch: '大阪支社', customerName: '関西電力', netSubtotal: 3456000, computedTax: 345600, computedTotal: 3801600, confidence: 0.96 },
  { invoiceNo: 'INV-2026-0056', branch: '名古屋支社', customerName: '中部電力ミライズ', netSubtotal: 892300, computedTax: 89230, computedTotal: 981530, confidence: 0.97 },
  { invoiceNo: 'INV-2026-0078', branch: '福岡支社', customerName: '九州電力', netSubtotal: 2150000, computedTax: 215000, computedTotal: 2365000, confidence: 0.99 },
  { invoiceNo: 'INV-2026-0091', branch: '仙台支社', customerName: '東北電力', netSubtotal: 567800, computedTax: 56780, computedTotal: 624580, confidence: 0.95 },
];

const CONNECTIONS = [
  { name: 'freee会計', status: 'connected' as const, lastSync: '2026-02-28 09:15', records: 3284 },
  { name: '弥生会計オンライン', status: 'syncing' as const, lastSync: '2026-02-28 09:30', records: 1847 },
  { name: 'マネーフォワード クラウド', status: 'connected' as const, lastSync: '2026-02-28 08:45', records: 2105 },
];

const STATUS_CFG = {
  connected: { label: '接続済', color: '#4caf50', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  syncing: { label: '同期中', color: '#f5c518', icon: <SyncIcon sx={{ fontSize: 14, animation: 'pulse-dot 1.5s infinite' }} /> },
};

const AI_INSIGHTS = [
  '今月の仕訳自動生成率は前月比 +2.1% 向上しています。',
  '電力料金カテゴリの仕訳パターンが安定。AI確信度が平均 98.3% に達しました。',
  '弥生会計との同期ラグが 15分 → 8分 に改善。次回最適化で5分以内を目標とします。',
];

const confidenceColor = (v: number) => (v >= 0.97 ? '#4caf50' : '#81c784');
const formatYen = (n: number) => `¥${n.toLocaleString()}`;

// ── グロウ付きKPIカード ──
const KpiCard = ({ icon, label, value, color, delay }: {
  icon: React.ReactNode; label: string; value: string; color: string; delay: number;
}) => (
  <Card
    sx={{
      flex: '1 1 180px',
      minWidth: 180,
      animation: `fade-in-up 0.5s ease-out ${delay}s both`,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      },
    }}
  >
    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Typography variant="caption" sx={{ color: '#9aa0a6' }}>{label}</Typography>
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
    </CardContent>
  </Card>
);

export const AccountingLinkMockTab = ({ metrics }: Props) => {
  const live = metrics.totalCount > 0;
  const ok = live ? metrics.okCount : DUMMY_KPI.okCount;
  const exc = live ? metrics.exceptionCount : DUMMY_KPI.exceptionCount;
  const rate = live ? metrics.automationRate : DUMMY_KPI.automationRate;
  const journal = live ? metrics.journalPreview : DUMMY_JOURNAL;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      {/* KPI */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <KpiCard icon={<AutoFixHighIcon />} label="自動仕訳対象" value={`${ok.toLocaleString()} 件`} color="#4caf50" delay={0.1} />
        <KpiCard icon={<CheckCircleOutlineIcon />} label="保留（例外）" value={`${exc.toLocaleString()} 件`} color="#f5c518" delay={0.2} />
        <KpiCard icon={<SyncAltIcon />} label="自動化率" value={`${(rate * 100).toFixed(1)}%`} color="#5c9ce6" delay={0.3} />
        <KpiCard icon={<AccountBalanceIcon />} label="接続ソフト" value="3社" color="#ab47bc" delay={0.4} />
      </Box>

      {/* 接続ステータス + 仕訳プレビュー */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* 接続ステータス */}
        <Card sx={{ flex: '1 1 320px', minWidth: 320, animation: 'fade-in-up 0.5s ease-out 0.2s both' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>会計ソフト接続ステータス</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {CONNECTIONS.map((conn) => {
                const cfg = STATUS_CFG[conn.status];
                return (
                  <Box
                    key={conn.name}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{conn.name}</Typography>
                      <Typography variant="caption">
                        最終同期: {conn.lastSync} / {conn.records.toLocaleString()} 件
                      </Typography>
                    </Box>
                    <Chip
                      icon={cfg.icon}
                      label={cfg.label}
                      size="small"
                      sx={{ bgcolor: `${cfg.color}22`, color: cfg.color, fontWeight: 600 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        {/* 仕訳プレビュー */}
        <Card sx={{ flex: '2 1 500px', minWidth: 400, animation: 'fade-in-up 0.5s ease-out 0.3s both' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
              AI仕訳プレビュー
              {live && <Chip label="検算連動" size="small" sx={{ ml: 1, bgcolor: '#4caf5022', color: '#4caf50', fontSize: '0.7rem' }} />}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>請求No</TableCell>
                    <TableCell>営業所</TableCell>
                    <TableCell>顧客名</TableCell>
                    <TableCell align="right">税抜小計</TableCell>
                    <TableCell align="right">税額</TableCell>
                    <TableCell align="right">合計</TableCell>
                    <TableCell>AI確信度</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {journal.map((row) => (
                    <TableRow key={row.invoiceNo} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.invoiceNo}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatYen(row.netSubtotal)}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatYen(row.computedTax)}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatYen(row.computedTotal)}</TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={row.confidence * 100}
                            sx={{
                              flex: 1, height: 6, borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.06)',
                              '& .MuiLinearProgress-bar': { bgcolor: confidenceColor(row.confidence) },
                            }}
                          />
                          <Typography variant="caption" sx={{ color: confidenceColor(row.confidence), fontWeight: 600, minWidth: 32 }}>
                            {(row.confidence * 100).toFixed(0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* AIインサイト */}
      <Card sx={{ animation: 'fade-in-up 0.5s ease-out 0.4s both' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#4caf50' }}>AIインサイト</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {AI_INSIGHTS.map((text, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex', gap: 1.5, p: 1.5, borderRadius: 2,
                  bgcolor: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.12)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700, mt: 0.2 }}>AI</Typography>
                <Typography variant="body2" sx={{ color: '#e8eaed', lineHeight: 1.6 }}>{text}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
