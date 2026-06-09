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
import { useAdminAttentionCounters } from '../../../hooks/admin/useAdminAttentionCounters';
import { useThemeMode } from '../../../providers/AppThemeProvider';
import { getMainRole } from '../../../utils/access/menuByRole';
import { PARTNER_REVIEW_ROLES, SALES_ROLES } from '../../../utils/access/accessControl';

import {
  adminMenuGroups,
  filterMenuGroupsByRoles,
} from '../menu/adminMenuConfig';

export const useAdminLayout = () => {
  const navigate = useNavigate();

  const { mode, toggleColorMode } = useThemeMode();
  const { user, profile, roles, logout } = useAuth();
  const canLoadAttentionCounters = roles.some((role) => (
    SALES_ROLES.includes(role) || PARTNER_REVIEW_ROLES.includes(role)
  ));
  const { counters } = useAdminAttentionCounters({ enabled: canLoadAttentionCounters });

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

  const filteredMenu = useMemo(() => {
    const groupsByRole = filterMenuGroupsByRoles(adminMenuGroups, roles);

    return groupsByRole.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        badgeCount: item.counterKey ? Number(counters?.[item.counterKey] || 0) : 0,
      })),
    }));
  }, [counters, roles]);

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
