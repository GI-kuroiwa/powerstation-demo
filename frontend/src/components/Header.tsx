import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import CalculateIcon from '@mui/icons-material/Calculate';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

export const Header = () => (
  <AppBar position="sticky" color="primary">
    <Toolbar>
      <CalculateIcon sx={{ mr: 1.5 }} />
      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
        PowerStation 請求検算AI
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          icon={<PersonOutlineIcon />}
          label="demo_user"
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.15)',
            color: 'white',
            '& .MuiChip-icon': { color: 'white' },
          }}
        />
      </Box>
    </Toolbar>
  </AppBar>
);
