import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#C9A227',
      light: '#E3C86A',
      dark: '#A8841F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2C2C2C',
      light: '#4A4A4A',
      dark: '#1A1A1A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F7F4EC',
      paper: '#FFFDF8',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#6B645A',
    },
    success: {
      main: '#4F8A5B',
    },
    warning: {
      main: '#C78B2C',
    },
    error: {
      main: '#C65A46',
    },
    info: {
      main: '#4B7BA5',
    },
    divider: '#E6DFD2',
  },

  typography: {
    fontFamily: `'Poppins', 'Arial', sans-serif`,
    h1: {
        fontFamily: `'Poppins', 'Arial', sans-serif`,
        fontWeight: 700,
        fontSize: '2.4rem',
        color: '#2C2C2C',
    },
    h2: {
        fontFamily: `'Poppins', 'Arial', sans-serif`,
        fontWeight: 700,
        fontSize: '2rem',
        color: '#2C2C2C',
    },
    h3: {
        fontFamily: `'Poppins', 'Arial', sans-serif`,
        fontWeight: 600,
        fontSize: '1.7rem',
        color: '#2C2C2C',
    },
    h4: {
        fontFamily: `'Poppins', 'Arial', sans-serif`,
        fontWeight: 600,
    },
    h5: {
        fontFamily: `'Poppins', 'Arial', sans-serif`,
        fontWeight: 600,
    },
    body1: {
        fontSize: '1rem',
    },
    body2: {
        fontSize: '0.92rem',
        color: '#6B645A',
    },
    button: {
        textTransform: 'none',
        fontWeight: 600,
        fontSize: '0.95rem',
    },
},

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F7F4EC',
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 20px',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#C9A227',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#B8921F',
          },
        },
        containedSecondary: {
          backgroundColor: '#2C2C2C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#1F1F1F',
          },
        },
        outlinedPrimary: {
          borderColor: '#C9A227',
          color: '#A8841F',
          '&:hover': {
            borderColor: '#B8921F',
            backgroundColor: 'rgba(201,162,39,0.05)',
          },
        },
        outlinedSecondary: {
          borderColor: '#2C2C2C',
          color: '#2C2C2C',
          '&:hover': {
            borderColor: '#1F1F1F',
            backgroundColor: 'rgba(44,44,44,0.04)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #E6DFD2',
          boxShadow: '0 8px 24px rgba(44, 44, 44, 0.05)',
          backgroundColor: '#FFFDF8',
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'medium',
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFDF8',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#DDD4C3',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#C9A227',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#C9A227',
            borderWidth: '1px',
          },
        },
        input: {
          padding: '12px 14px',
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#6B645A',
          '&.Mui-focused': {
            color: '#A8841F',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#C9A227',
          height: 3,
          borderRadius: 999,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          color: '#6B645A',
          '&.Mui-selected': {
            color: '#A8841F',
          },
        },
      },
    },

    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E6DFD2',
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFDF8',
          color: '#2C2C2C',
          boxShadow: 'none',
          borderBottom: '1px solid #E6DFD2',
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FCF9F2',
          color: '#2C2C2C',
          borderRight: '1px solid #E6DFD2',
        },
      },
    },
  },
});
