// Une los providers globales de la aplicación.
// El orden es importante: tema visual, router, TanStack Query, autenticación y date pickers.

import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { validateEnv } from '../config/env';
import { AppThemeProvider } from './AppThemeProvider';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { FeedbackProvider } from './FeedbackProvider';

validateEnv();

export const AppProviders = ({ children }) => {
  return (
    <AppThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <BrowserRouter>
          <QueryProvider>
            <AuthProvider>
              <FeedbackProvider>{children}</FeedbackProvider>
            </AuthProvider>
          </QueryProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </AppThemeProvider>
  );
};
