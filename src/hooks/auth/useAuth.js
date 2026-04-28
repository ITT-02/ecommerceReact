// Hook público para acceder a la autenticación desde cualquier componente.

import { useContext } from 'react';
import { AuthContext } from '../../providers/AuthProvider';

/**
 * Devuelve el contexto de autenticación.
 *
 * Ejemplo:
 * const { user, login, logout, roles } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
};