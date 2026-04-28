/**
 * Layout principal del panel administrativo.
 *
 * Responsabilidad:
 * - Armar la estructura general del admin.
 * - Conectar sidebar, drawer móvil, topbar y contenido interno.
 *
 * No define opciones del menú ni lógica de autenticación directamente.
 */

import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { useAdminLayout } from './hooks/useAdminLayout';
import { AdminMobileDrawer } from './sidebar/AdminMobileDrawer';
import { AdminSidebar } from './sidebar/AdminSidebar';
import { AdminTopbar } from './topbar/AdminTopbar';

const DRAWER_WIDTH = 284;
const DRAWER_COLLAPSED_WIDTH = 92;
const MOBILE_DRAWER_WIDTH = 280;

export const AdminLayout = () => {
  const {
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
  } = useAdminLayout();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <AdminSidebar
        collapsed={collapsed}
        filteredMenu={filteredMenu}
        drawerWidth={DRAWER_WIDTH}
        collapsedWidth={DRAWER_COLLAPSED_WIDTH}
        onToggleCollapsed={handleToggleCollapsed}
        onLogout={handleLogout}
      />

      <AdminMobileDrawer
        open={mobileOpen}
        filteredMenu={filteredMenu}
        width={MOBILE_DRAWER_WIDTH}
        onClose={handleToggleMobileDrawer}
        onLogout={handleLogout}
      />

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AdminTopbar
          user={displayUser}
          mode={mode}
          accountAnchorEl={accountAnchorEl}
          onOpenMobileMenu={handleToggleMobileDrawer}
          onOpenAccountMenu={handleOpenAccountMenu}
          onCloseAccountMenu={handleCloseAccountMenu}
          onToggleTheme={toggleColorMode}
          onLogout={handleLogout}
        />

        <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};