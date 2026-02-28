import type { Components, Theme } from '@mui/material';

export const components: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: '#0f1318',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        fontWeight: 600,
      },
      containedPrimary: {
        boxShadow: '0 2px 8px rgba(92, 156, 230, 0.3)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(92, 156, 230, 0.4)',
        },
      },
      containedSecondary: {
        color: '#1a2028',
        boxShadow: '0 2px 8px rgba(245, 197, 24, 0.3)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(245, 197, 24, 0.4)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
      },
    },
    defaultProps: {
      elevation: 0,
      variant: 'outlined',
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundImage: 'none',
        backgroundColor: 'rgba(26, 32, 40, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      },
    },
    defaultProps: {
      elevation: 0,
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        backgroundImage: 'none',
      },
    },
    defaultProps: {
      elevation: 0,
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        minHeight: 48,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 700,
          backgroundColor: '#151c25',
          color: '#e8eaed',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: '#2d3748',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        height: 10,
        backgroundColor: '#2d3748',
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        '&:before': { display: 'none' },
      },
    },
  },
};
