// Une los providers globales de la aplicación.
// El orden es importante: tema visual, router, TanStack Query y autenticación.

import { BrowserRouter } from 'react-router-dom';
import { validateEnv } from '../config/env';
import { AppThemeProvider } from './AppThemeProvider';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';

validateEnv();

export const AppProviders = ({ children }) => {
  return (
    <AppThemeProvider>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </AppThemeProvider>
  );
};
