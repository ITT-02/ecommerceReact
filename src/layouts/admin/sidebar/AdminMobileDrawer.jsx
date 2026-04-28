/**
 * Drawer móvil del panel administrativo.
 *
 * Es la versión responsive del sidebar.
 * Por eso vive dentro de la carpeta sidebar/.
 */

import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';

import { Close, Logout } from '@mui/icons-material';

import { AdminActionItem } from '../menu/AdminActionItem';
import { AdminMenuList } from '../menu/AdminMenuList';

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
      sx={{
        display: { xs: 'block', lg: 'none' },

        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          p: 2,
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
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700 }}>
                Aliqora
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Panel administrativo
              </Typography>
            </Box>

            <IconButton onClick={onClose} color="primary" aria-label="Cerrar menú">
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          <AdminMenuList
            groups={filteredMenu}
            collapsed={false}
            onItemClick={onClose}
          />
        </Box>

        <Box sx={{ pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <AdminActionItem
            label="Cerrar sesión"
            icon={<Logout fontSize="small" />}
            onClick={onLogout}
            color="error.main"
            minWidthIcon={40}
          />
        </Box>
      </Stack>
    </Drawer>
  );
};
