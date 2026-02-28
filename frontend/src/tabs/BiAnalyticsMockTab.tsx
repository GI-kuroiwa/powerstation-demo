import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import type { DerivedMetrics, BranchExceptionCount, BranchProfitEstimate, ReasonCodeCount } from '../utils/derivedMetrics';
import type { ReasonCode } from '../types';

interface Props {
  metrics: DerivedMetrics;
}

const REASON_LABELS: Record<string, string> = {
  REQUIRED_MISSING: '必須欠落',
  MULTI_DISCOUNT: '二重値引',
  TAXRATE_NOT_10: '税率不一致',
  TAX_MISMATCH: '税額差異',
  DISCOUNT_MISMATCH: '値引差異',
  TOTAL_MISMATCH: '合計差異',
};

const BAR_COLORS = ['#5c9ce6', '#4caf50', '#f5c518', '#ef5350', '#ab47bc', '#29b6f6'];

// ── ダミーデータ（検算未実行時） ──
const DUMMY = {
  exceptionRate: 0.133,
  topReasonCode: 'TAX_MISMATCH' as ReasonCode,
  topBranch: '東京本社',
  byBranch: [
    { branch: '東京本社', exceptions: 5, total: 30 },
    { branch: '大阪支社', exceptions: 3, total: 25 },
    { branch: '名古屋支社', exceptions: 2, total: 20 },
    { branch: '福岡支社', exceptions: 2, total: 15 },
  ] as BranchExceptionCount[],
  byReason: [
    { reasonCode: 'TAX_MISMATCH' as ReasonCode, count: 5 },
    { reasonCode: 'TOTAL_MISMATCH' as ReasonCode, count: 3 },
    { reasonCode: 'DISCOUNT_MISMATCH' as ReasonCode, count: 2 },
    { reasonCode: 'REQUIRED_MISSING' as ReasonCode, count: 1 },
    { reasonCode: 'TAXRATE_NOT_10' as ReasonCode, count: 1 },
  ] as ReasonCodeCount[],
};

const DUMMY_PROFIT = {
  totalRevenue: 185_400_000,
  totalGrossProfit: 50_658_000,
  totalProfitMargin: 0.273,
  branchProfit: [
    { branch: '東京本社', revenue: 72_000_000, estimatedCost: 51_840_000, grossProfit: 20_160_000, profitMargin: 0.28 },
    { branch: '大阪支社', revenue: 58_200_000, estimatedCost: 43_650_000, grossProfit: 14_550_000, profitMargin: 0.25 },
    { branch: '名古屋支社', revenue: 38_500_000, estimatedCost: 26_950_000, grossProfit: 11_550_000, profitMargin: 0.30 },
    { branch: '福岡支社', revenue: 16_700_000, estimatedCost: 12_358_000, grossProfit: 4_342_000, profitMargin: 0.26 },
  ] as BranchProfitEstimate[],
};

const formatYen = (n: number) => `¥${n.toLocaleString()}`;

const AI_INSIGHTS_DUMMY = [
  { type: 'trend' as const, text: '例外率は前回比 -1.2pt で改善傾向。自動化率向上の効果が出ています。' },
  { type: 'anomaly' as const, text: '東京本社の例外率が他拠点の約2倍。特定サプライヤーの請求フォーマット変更が原因と推定されます。' },
  { type: 'optimization' as const, text: '名古屋支社の処理パターンを他拠点に展開することで、全体の例外率を 0.3% 削減可能と予測します。' },
  { type: 'optimization' as const, text: '利益率分析: 名古屋支社の粗利率30%がベスト。原価管理手法を大阪支社に展開すれば年間約1,200万円の利益改善が見込めます。' },
];

const INSIGHT_CFG = {
  trend: { icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: '#5c9ce6', label: 'トレンド' },
  anomaly: { icon: <WarningAmberIcon sx={{ fontSize: 16 }} />, color: '#f5c518', label: '異常検知' },
  optimization: { icon: <LightbulbIcon sx={{ fontSize: 16 }} />, color: '#4caf50', label: '最適化提案' },
};

// ── グロウ付きKPIカード ──
const KpiCard = ({ icon, label, value, color, delay }: {
  icon: React.ReactNode; label: string; value: string; color: string; delay: number;
}) => (
  <Card
    sx={{
      flex: '1 1 180px', minWidth: 180,
      animation: `fade-in-up 0.5s ease-out ${delay}s both`,
      position: 'relative', overflow: 'hidden',
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

// ── 横棒グラフ ──
const HorizontalBarChart = ({ title, data }: {
  title: string;
  data: { label: string; value: number; color: string }[];
}) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <Card sx={{ flex: '1 1 400px', minWidth: 300, animation: 'fade-in-up 0.5s ease-out 0.3s both' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>{title}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {data.map((d) => (
            <Box key={d.label}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{d.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: d.color }}>{d.value} 件</Typography>
              </Box>
              <Box sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.06)' }}>
                <Box
                  sx={{
                    height: '100%', borderRadius: 5,
                    width: `${(d.value / maxVal) * 100}%`,
                    bgcolor: d.color,
                    transition: 'width 0.6s ease-out',
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

// ── 利益バーチャート ──
const ProfitBarChart = ({ data }: { data: BranchProfitEstimate[] }) => {
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <Card sx={{ animation: 'fade-in-up 0.5s ease-out 0.35s both' }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>
          <AccountBalanceWalletIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'text-bottom', color: '#4caf50' }} />
          AI利益自動計算（営業所別）
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((d) => (
            <Box key={d.branch}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.branch}</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="caption" sx={{ color: '#9aa0a6' }}>
                    売上 {formatYen(d.revenue)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 700 }}>
                    粗利 {formatYen(d.grossProfit)}（{(d.profitMargin * 100).toFixed(1)}%）
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 16, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.06)', position: 'relative' }}>
                <Box sx={{
                  height: '100%', borderRadius: 5, position: 'absolute',
                  width: `${(d.revenue / maxRev) * 100}%`, bgcolor: 'rgba(92,156,230,0.3)',
                }} />
                <Box sx={{
                  height: '100%', borderRadius: 5, position: 'absolute',
                  width: `${(d.grossProfit / maxRev) * 100}%`, bgcolor: '#4caf50',
                  transition: 'width 0.6s ease-out',
                }} />
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 3, mt: 2, justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 8, borderRadius: 2, bgcolor: 'rgba(92,156,230,0.3)' }} />
            <Typography variant="caption" sx={{ color: '#9aa0a6' }}>売上</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 8, borderRadius: 2, bgcolor: '#4caf50' }} />
            <Typography variant="caption" sx={{ color: '#9aa0a6' }}>粗利</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const BiAnalyticsMockTab = ({ metrics }: Props) => {
  const live = metrics.totalCount > 0;
  const excRate = live ? metrics.exceptionRate : DUMMY.exceptionRate;
  const topReason = live ? metrics.topReasonCode : DUMMY.topReasonCode;
  const topBranch = live ? metrics.topBranch : DUMMY.topBranch;
  const byBranch = live ? metrics.byBranch : DUMMY.byBranch;
  const byReason = live ? metrics.byReason : DUMMY.byReason;
  const profitData = live ? metrics.branchProfit : DUMMY_PROFIT.branchProfit;
  const totalRevenue = live ? metrics.totalRevenue : DUMMY_PROFIT.totalRevenue;
  const totalGrossProfit = live ? metrics.totalGrossProfit : DUMMY_PROFIT.totalGrossProfit;
  const totalProfitMargin = live ? metrics.totalProfitMargin : DUMMY_PROFIT.totalProfitMargin;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
      {/* KPI */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <KpiCard icon={<InsightsIcon />} label="例外率" value={`${(excRate * 100).toFixed(1)}%`} color="#f5c518" delay={0.1} />
        <KpiCard
          icon={<BarChartIcon />}
          label="主原因"
          value={topReason ? (REASON_LABELS[topReason] ?? topReason) : '—'}
          color="#ef5350"
          delay={0.2}
        />
        <KpiCard icon={<TrendingUpIcon />} label="最多例外営業所" value={topBranch ?? '—'} color="#5c9ce6" delay={0.3} />
        <KpiCard
          icon={<AccountBalanceWalletIcon />}
          label="推定粗利率"
          value={`${(totalProfitMargin * 100).toFixed(1)}%`}
          color="#4caf50"
          delay={0.4}
        />
      </Box>

      {live && (
        <Box sx={{ animation: 'fade-in-up 0.3s ease-out' }}>
          <Chip label="検算結果を反映中" size="small" sx={{ bgcolor: '#5c9ce622', color: '#5c9ce6', fontSize: '0.75rem' }} />
        </Box>
      )}

      {/* 利益サマリ */}
      <Card sx={{ animation: 'fade-in-up 0.5s ease-out 0.25s both', position: 'relative', overflow: 'hidden',
        '&::before': {
          content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, transparent, #4caf50, transparent)',
        },
      }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#4caf50' }}>
            AI利益自動計算サマリ
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#9aa0a6' }}>総売上（税抜・検算済）</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{formatYen(totalRevenue)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#9aa0a6' }}>推定粗利</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>{formatYen(totalGrossProfit)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: '#9aa0a6' }}>粗利率</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4caf50' }}>
                {(totalProfitMargin * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 利益バーチャート */}
      <ProfitBarChart data={profitData} />

      {/* 例外分析チャート */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <HorizontalBarChart
          title="営業所別 例外件数"
          data={byBranch
            .filter((b) => b.exceptions > 0)
            .map((b, i) => ({ label: b.branch, value: b.exceptions, color: BAR_COLORS[i % BAR_COLORS.length] }))}
        />
        <HorizontalBarChart
          title="reason_code別 件数"
          data={byReason.map((r, i) => ({
            label: REASON_LABELS[r.reasonCode] ?? r.reasonCode,
            value: r.count,
            color: BAR_COLORS[i % BAR_COLORS.length],
          }))}
        />
      </Box>

      {/* AIインサイト */}
      <Card sx={{ animation: 'fade-in-up 0.5s ease-out 0.4s both' }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700 }}>AIインサイト</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {AI_INSIGHTS_DUMMY.map((insight, i) => {
              const cfg = INSIGHT_CFG[insight.type];
              return (
                <Box
                  key={i}
                  sx={{
                    p: 2, borderRadius: 2,
                    bgcolor: `${cfg.color}08`, border: `1px solid ${cfg.color}20`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Box sx={{ color: cfg.color, display: 'flex' }}>{cfg.icon}</Box>
                    <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 700 }}>{cfg.label}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#e8eaed', lineHeight: 1.6 }}>{insight.text}</Typography>
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
