// Provider visual del sistema.
// Administra el modo claro/oscuro y entrega el tema de Material UI.
// Fuentes oficiales Aliqora: Cinzel para títulos y Montserrat para interfaz.
import '@fontsource/cinzel/latin.css';
import '@fontsource/montserrat/latin.css';
import '@fontsource/poppins/latin.css';

import { CssBaseline } from '@mui/material';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

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
