import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const AiStatusIndicator = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: '#4caf50',
        animation: 'pulse-dot 2s ease-in-out infinite',
        boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)',
      }}
    />
    <Typography variant="caption" sx={{ color: '#81c784', fontSize: '0.7rem', fontWeight: 500 }}>
      AI稼働中
    </Typography>
  </Box>
);
