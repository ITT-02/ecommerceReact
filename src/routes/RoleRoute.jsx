// Protege contenido según roles permitidos.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { roles } = useAuth();

  const allowed = allowedRoles.length === 0 || allowedRoles.some((role) => roles.includes(role));

  if (!allowed) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
};
