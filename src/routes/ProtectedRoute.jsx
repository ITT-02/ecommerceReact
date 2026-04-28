// Protege rutas que requieren sesión.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { useAuth } from '../hooks/auth/useAuth';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen message="Validando sesión..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
