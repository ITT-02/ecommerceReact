/**
 * Drawer móvil de la tienda pública.
 *
 * Es parte del navbar porque representa la navegación pública en móvil.
 */

import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  Typography,
} from '@mui/material';

import { Link as RouterLink, NavLink } from 'react-router-dom';

export const StoreMobileDrawer = ({
  open,
  isLoggedIn,
  currentUrl,
  mainMenuItems,
  catalogMenuItems,
  onClose,
}) => {
  const renderMainNavButton = (item) => (
    <Button
      key={item.to}
      component={NavLink}
      to={item.to}
      onClick={onClose}
      color="inherit"
      sx={{
        justifyContent: 'flex-start',
        fontWeight: 600,
        color: 'text.primary',
        '&.active': {
          color: 'primary.main',
          fontWeight: 800,
        },
      }}
    >
      {item.label}
    </Button>
  );

  const renderCatalogButton = (item) => (
    <Button
      key={item.to}
      component={RouterLink}
      to={item.to}
      onClick={onClose}
      color="inherit"
      sx={{
        justifyContent: 'flex-start',
        fontWeight: currentUrl === item.to ? 800 : 600,
        color: currentUrl === item.to ? 'primary.main' : 'text.primary',
      }}
    >
      {item.label}
    </Button>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{ display: { xs: 'block', md: 'none' } }}
    >
      <Box sx={{ width: 280, p: 2 }}>
        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>
          Aliqora
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Empaques
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1}>
          {mainMenuItems.map(renderMainNavButton)}

          <Divider sx={{ my: 1 }} />

          <Typography
            variant="caption"
            sx={{
              px: 1,
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: 0.8,
            }}
          >
            Catálogo
          </Typography>

          {catalogMenuItems.map(renderCatalogButton)}

          <Divider sx={{ my: 1 }} />

          {isLoggedIn ? (
            <>
              <Button
                component={NavLink}
                to="/mis-pedidos"
                onClick={onClose}
                color="inherit"
                sx={{ justifyContent: 'flex-start' }}
              >
                Mis pedidos
              </Button>

              <Button
                component={NavLink}
                to="/perfil"
                onClick={onClose}
                color="inherit"
                sx={{ justifyContent: 'flex-start' }}
              >
                Mi perfil
              </Button>
            </>
          ) : (
            <>
              <Button component={NavLink} to="/login" onClick={onClose} variant="contained">
                Ingresar
              </Button>

              <Button component={NavLink} to="/registro" onClick={onClose} variant="outlined">
                Crear cuenta
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};
