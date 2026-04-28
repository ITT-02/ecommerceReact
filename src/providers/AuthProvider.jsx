// Provider global de autenticación.
// Hace disponible el estado de auth para toda la aplicación.

import { createContext } from 'react';
import { useAuthController } from '../hooks/auth/useAuthController';

export const AuthContext = createContext(null);

/**
 * Envuelve la aplicación y comparte el estado de autenticación.
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuthController();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};