import type { ThemeOptions } from '@mui/material/styles';

const fontFamily = [
  '"Noto Sans JP"',
  '"Inter"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  'sans-serif',
].join(',');

export const typography: ThemeOptions['typography'] = {
  fontFamily,
  h4: {
    fontWeight: 700,
    fontSize: '1.75rem',
  },
  h5: {
    fontWeight: 700,
    fontSize: '1.25rem',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.1rem',
  },
  subtitle1: {
    fontWeight: 600,
    fontSize: '1rem',
  },
  body1: {
    fontSize: '0.9375rem',
  },
  body2: {
    fontSize: '0.875rem',
  },
  caption: {
    fontSize: '0.75rem',
    color: '#9aa0a6',
  },
};
