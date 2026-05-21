// Componente raíz de la aplicación.
// Envuelve la app con providers globales y renderiza el sistema de rutas.
// Provider de fechas

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './routes/AppRouter';

export const App = () => {
  return (
    <AppProviders>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AppRouter />
      </LocalizationProvider>
    </AppProviders>
  );
};