import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        gap: 2,
      }}
    >
      <Typography variant="h4" color="text.secondary" fontWeight={700}>
        404
      </Typography>
      <Typography variant="body1" color="text.secondary">
        ページが見つかりません
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        ダッシュボードに戻る
      </Button>
    </Box>
  );
};
