// Componente raíz de la aplicación.
// Envuelve la app con providers globales y renderiza el sistema de rutas.

import { AppProviders } from './providers/AppProviders';
import { AppRouter } from './routes/AppRouter';

export const App = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};
