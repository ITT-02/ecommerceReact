// Provider visual del sistema.
// Administra el modo claro/oscuro y entrega el tema de Material UI.
// Fuente global del sistema.
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';

import { CssBaseline } from '@mui/material';
import { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider, responsiveFontSizes } from '@mui/material/styles';
import { getTheme } from '../styles/theme';

const ThemeModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('theme-mode') || 'light');

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', next);
      return next;
    });
  };

  const theme = useMemo(() => responsiveFontSizes(getTheme(mode)), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
