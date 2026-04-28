/**
 * Sidebar de escritorio del panel administrativo.
 *
 * Responsabilidad:
 * - Mostrar marca del panel.
 * - Mostrar menú administrativo.
 * - Permitir colapsar/expandir.
 * - Mostrar acciones finales del layout.
 */

import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';

import { ChevronLeft, ChevronRight, Logout } from '@mui/icons-material';

import { AdminActionItem } from '../menu/AdminActionItem';
import { AdminMenuList } from '../menu/AdminMenuList';

export const AdminSidebar = ({
  collapsed,
  filteredMenu,
  drawerWidth,
  collapsedWidth,
  onToggleCollapsed,
  onLogout,
}) => {
  const desktopDrawerWidth = collapsed ? collapsedWidth : drawerWidth;

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', lg: 'block' },
        width: desktopDrawerWidth,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: desktopDrawerWidth,
          boxSizing: 'border-box',
          p: 2,
          overflowX: 'hidden',
          transition: 'width 0.25s ease',
          bgcolor: 'background.default',
        },
      }}
    >
      <Stack sx={{ height: '100%', minHeight: 0 }} spacing={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'space-between',
              gap: 1,
            }}
          >
            {!collapsed && (
              <Box>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                  Aliqora
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Panel administrativo
                </Typography>
              </Box>
            )}

            <IconButton
              onClick={onToggleCollapsed}
              color="primary"
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            pr: collapsed ? 0 : 0.5,
          }}
        >
          <AdminMenuList groups={filteredMenu} collapsed={collapsed} />
        </Box>

        <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <AdminActionItem
            label={collapsed ? '' : 'Cerrar sesión'}
            icon={<Logout fontSize="small" />}
            onClick={onLogout}
            color="error.main"
            minWidthIcon={collapsed ? 0 : 40}
          />
        </Box>
      </Stack>
    </Drawer>
  );
};
