// Evita que un usuario logueado vuelva a la página de login.

import { Navigate, Outlet } from 'react-router-dom';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { useAuth } from '../hooks/auth/useAuth';
import { getDefaultPathByRoles } from '../utils/access/menuByRole';

export const PublicRoute = () => {
  const { isAuthenticated, loading, roles } = useAuth();

  if (loading) return <LoadingScreen message="Validando sesión..." />;

  if (isAuthenticated) {
    return <Navigate to={getDefaultPathByRoles(roles)} replace />;
  }

  return <Outlet />;
};
