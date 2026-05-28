/**
 * Sidebar de escritorio del panel administrativo.
 *
 * Los colores del menú se controlan desde theme.palette.custom.semantic.adminNavigation.
 */

import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight, Logout } from '@mui/icons-material';

import { AdminActionItem } from '../menu/AdminActionItem';
import { AdminMenuList } from '../menu/AdminMenuList';
import { AdminBrandLogo } from '../components/AdminBrandLogo';

const getAdminNavigation = (theme) => theme.palette.custom.semantic.adminNavigation;

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
      sx={(theme) => {
        const nav = getAdminNavigation(theme);

        return {
          display: { xs: 'none', lg: 'block' },
          width: desktopDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: desktopDrawerWidth,
            boxSizing: 'border-box',
            p: 2,
            overflowX: 'hidden',
            transition: `width ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
            bgcolor: nav.drawerBg,
            color: nav.drawerText,
            borderRight: `1px solid ${nav.divider}`,
          },
        };
      }}
    >
      <Stack sx={{ height: '100%', minHeight: 0 }} spacing={2}>
        <Box
          sx={(theme) => {
            const nav = getAdminNavigation(theme);

            return {
              px: collapsed ? 0.5 : 1.25,
              py: 1.5,
              borderRadius: theme.palette.custom.radius.xs,
              border: `1px solid ${nav.brandBorder}`,
              bgcolor: nav.brandSurface,
            };
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
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 <AdminBrandLogo collapsed={collapsed} />
                </Box>
              </Box>
            )}

            <IconButton
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
              sx={(theme) => {
                const nav = getAdminNavigation(theme);

                return {
                  color: nav.brandTitle,
                  bgcolor: nav.toggleBg,
                  '&:hover': {
                    bgcolor: nav.toggleHoverBg,
                    color: nav.brandTitle,
                  },
                };
              }}
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

        <Box
          sx={(theme) => ({
            pt: 1.5,
            borderTop: `1px solid ${getAdminNavigation(theme).divider}`,
          })}
        >
          <AdminActionItem
            label={collapsed ? '' : 'Cerrar sesión'}
            icon={<Logout fontSize="small" />}
            onClick={onLogout}
            tone="danger"
            minWidthIcon={collapsed ? 0 : 40}
          />
        </Box>
      </Stack>
    </Drawer>
  );
};
