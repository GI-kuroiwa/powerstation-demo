import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export const DashboardPage = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Paper
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        border: '2px dashed',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
      <Typography variant="h6" color="text.secondary">
        CSVファイルをドラッグ&ドロップ
      </Typography>
      <Typography variant="body2" color="text.secondary">
        またはクリックしてファイルを選択
      </Typography>
    </Paper>
  </Box>
);
