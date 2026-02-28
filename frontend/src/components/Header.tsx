import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { AiStatusIndicator } from './AiStatusIndicator';

export const Header = () => (
  <AppBar
    position="sticky"
    sx={{
      bgcolor: 'rgba(26, 32, 40, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    }}
  >
    <Toolbar>
      <AutoAwesomeIcon sx={{ mr: 1, color: '#f5c518' }} />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mr: 1,
          background: 'linear-gradient(90deg, #8ec4ff, #f5c518)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        PowerStation AI
      </Typography>
      <AiStatusIndicator />
      <Box sx={{ flexGrow: 1 }} />
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
    </Toolbar>
  </AppBar>
);
