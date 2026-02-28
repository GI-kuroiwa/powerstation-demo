import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { Summary } from '../../types';

interface KpiCardProps {
  label: string;
  value: string | number;
  color?: string;
}

const KpiCard = ({ label, value, color }: KpiCardProps) => (
  <Card sx={{ flex: '1 1 160px', minWidth: 140 }}>
    <CardContent sx={{ textAlign: 'center', py: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: color || 'text.primary' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

interface SummaryTabProps {
  summary: Summary;
}

export const SummaryTab = ({ summary }: SummaryTabProps) => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
    <KpiCard label="総件数" value={summary.total} color="#f5c518" />
    <KpiCard label="正常件数" value={summary.ok} color="#4caf50" />
    <KpiCard label="例外件数" value={summary.exceptions} color="#ef5350" />
    <KpiCard label="例外率" value={`${summary.exception_rate}%`} color="#f5c518" />
    <KpiCard label="処理時間" value={`${summary.duration_sec}秒`} color="#29b6f6" />
  </Box>
);
