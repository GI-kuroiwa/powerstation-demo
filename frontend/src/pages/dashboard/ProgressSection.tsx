import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import type { BranchStatus } from '../../types';

interface ProgressSectionProps {
  processed: number;
  total: number;
  percent: number;
  branchStatus: BranchStatus;
}

export const ProgressSection = ({ processed, total, percent, branchStatus }: ProgressSectionProps) => (
  <Box sx={{ mt: 3, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
      <Typography variant="subtitle1" fontWeight={600}>処理進捗</Typography>
      <Typography variant="subtitle1" fontWeight={700} color="primary.main">
        {processed} / {total}（{percent}%）
      </Typography>
    </Box>
    <LinearProgress
      variant="determinate"
      value={percent}
      color={percent === 100 ? 'success' : 'primary'}
      sx={{ height: 10, borderRadius: 5 }}
    />
    <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
      {Object.entries(branchStatus).map(([branch, s]) => (
        <Chip
          key={branch}
          size="small"
          icon={s.status === 'done' ? <CheckCircleIcon /> : <HourglassTopIcon />}
          label={`${branch} ${s.processed}/${s.total}件${s.status === 'done' ? ' 完了' : ' 処理中...'}`}
          color={s.status === 'done' ? 'success' : 'warning'}
          variant="outlined"
        />
      ))}
    </Box>
  </Box>
);
