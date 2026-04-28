/**
 * Hook exclusivo del layout administrativo.
 *
 * Centraliza la lógica del layout:
 * - usuario visible
 * - menú filtrado por roles
 * - sidebar colapsado
 * - drawer móvil
 * - menú de cuenta
 * - cambio de tema
 * - cierre de sesión
 */

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../hooks/auth/useAuth';
import { useThemeMode } from '../../../providers/AppThemeProvider';
import { getMainRole } from '../../../utils/access/menuByRole';

import {
  adminMenuGroups,
  filterMenuGroupsByRoles,
} from '../menu/adminMenuConfig';

export const useAdminLayout = () => {
  const navigate = useNavigate();

  const { mode, toggleColorMode } = useThemeMode();
  const { user, profile, roles, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);

  const displayUser = useMemo(() => {
    const fullNameFromParts = `${profile?.nombres || ''} ${
      profile?.apellidos || ''
    }`.trim();

    return {
      nombreCompleto:
        profile?.nombre_completo ||
        fullNameFromParts ||
        user?.email ||
        'Usuario',
      rol: getMainRole(roles),
      email: user?.email,
    };
  }, [profile, roles, user]);

  const filteredMenu = useMemo(
    () => filterMenuGroupsByRoles(adminMenuGroups, roles),
    [roles],
  );

  const handleToggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  const handleToggleMobileDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleOpenAccountMenu = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleCloseAccountMenu = () => {
    setAccountAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseAccountMenu();
    await logout();
    navigate('/login', { replace: true });
  };

  return {
    mode,
    collapsed,
    mobileOpen,
    accountAnchorEl,
    displayUser,
    filteredMenu,
    toggleColorMode,
    handleToggleCollapsed,
    handleToggleMobileDrawer,
    handleOpenAccountMenu,
    handleCloseAccountMenu,
    handleLogout,
  };
};
