// Provider visual del sistema.
// Administra el modo claro/oscuro y entrega el tema de Material UI.
// Fuentes oficiales Aliqora: Cinzel para títulos y Montserrat para interfaz.
import '@fontsource/cinzel/400.css';
import '@fontsource/cinzel/500.css';
import '@fontsource/cinzel/600.css';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

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
