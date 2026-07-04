import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C63FF',
      light: '#8B83FF',
      dark: '#4A42CC',
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF8E8E',
      dark: '#CC4444',
    },
    success: {
      main: '#00C9A7',
      light: '#33D9B9',
      dark: '#00A185',
    },
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748',
      secondary: '#718096',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(108, 99, 255, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6C63FF 0%, #3F3D9E 100%)',
          color: '#fff',
        },
        outlinedPrimary: {
          borderColor: '#6C63FF',
          color: '#6C63FF',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
        elevation1: { boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 50, fontWeight: 500 },
      },
    },
  },
});

export default theme;