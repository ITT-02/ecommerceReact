/**
 * Drawer móvil del panel administrativo.
 *
 * Los colores del menú se controlan desde theme.palette.custom.semantic.adminNavigation.
 */

import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { Close, Logout } from '@mui/icons-material';

import { AdminActionItem } from '../menu/AdminActionItem';
import { AdminMenuList } from '../menu/AdminMenuList';

import aliqoraLogo from '../../../assets/brand/aliqora-logo.png';

const getAdminNavigation = (theme) => theme.palette.custom.semantic.adminNavigation;

export const AdminMobileDrawer = ({
  open,
  filteredMenu,
  width,
  onClose,
  onLogout,
}) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={(theme) => {
        const nav = getAdminNavigation(theme);

        return {
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            p: 2,
            bgcolor: nav.drawerBg,
            color: nav.drawerText,
          },
        };
      }}
    >
      <Stack sx={{ height: '100%', minHeight: 0 }} spacing={2}>
        <Box
          sx={(theme) => {
            const nav = getAdminNavigation(theme);

            return {
              p: 1.5,
              borderRadius: theme.palette.custom.radius.xs,
              bgcolor: nav.brandSurface,
              border: `1px solid ${nav.brandBorder}`,
            };
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
           <Box
                component="img"
                src={aliqoraLogo}
                alt="Aliqora Empaques"
                sx={{
                  display: 'block',
                  width: '100%',
                  maxWidth: 180,
                  height: 44,
                  objectFit: 'contain',
                  objectPosition: 'left center',
                }}
              />


            <IconButton
              onClick={onClose}
              aria-label="Cerrar menú"
              sx={(theme) => ({
                color: getAdminNavigation(theme).brandTitle,
                flexShrink: 0,
              })}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          <AdminMenuList
            groups={filteredMenu}
            collapsed={false}
            onItemClick={onClose}
          />
        </Box>

        <Box
          sx={(theme) => ({
            pt: 1.5,
            borderTop: `1px solid ${getAdminNavigation(theme).divider}`,
          })}
        >
          <AdminActionItem
            label="Cerrar sesión"
            icon={<Logout fontSize="small" />}
            onClick={onLogout}
            tone="danger"
            minWidthIcon={40}
          />
        </Box>
      </Stack>
    </Drawer>
  );
};