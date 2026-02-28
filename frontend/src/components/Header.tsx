import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CalculateIcon from '@mui/icons-material/Calculate';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

export const Header = () => (
  <AppBar position="sticky" sx={{ bgcolor: '#1a2028', borderBottom: '1px solid #2d3748' }}>
    <Toolbar>
      <CalculateIcon sx={{ mr: 1.5, color: '#f5c518' }} />
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
        PowerStation 請求検算AI
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<PersonOutlineIcon />}
          label="demo_user"
          size="small"
          sx={{
            bgcolor: 'rgba(92,156,230,0.15)',
            color: 'primary.light',
            '& .MuiChip-icon': { color: 'primary.light' },
          }}
        />
      </Box>
    </Toolbar>
  </AppBar>
);
