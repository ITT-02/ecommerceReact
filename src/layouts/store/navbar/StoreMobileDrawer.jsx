/**
 * Drawer móvil de la tienda pública.
 */

import { Box, Button, Divider, Drawer, Stack, Typography } from '@mui/material';
import { Link as RouterLink, NavLink } from 'react-router-dom';

import { hasInternalRole } from '../../../utils/access/menuByRole';

const navButtonSx = (isSelected = false) => (theme) => {
  const nav = theme.palette.custom.semantic.storeNavigation;

  return {
    justifyContent: 'flex-start',
    fontWeight: isSelected ? 800 : 600,
    color: isSelected ? nav.brandText : nav.textMuted,
    '&.active': {
      color: nav.brandText,
      bgcolor: nav.activeBg,
      fontWeight: 800,
    },
    '&:hover': {
      color: nav.brandText,
      bgcolor: nav.hoverBg,
      transform: 'none',
      boxShadow: 'none',
    },
  };
};

export const StoreMobileDrawer = ({
  open,
  isLoggedIn,
  roles = [],
  currentUrl,
  mainMenuItems,
  catalogMenuItems,
  afterCatalogMenuItems = [],
  onClose,
}) => {
  const isInternalUser = hasInternalRole(roles);

  const renderNavButton = (item, useExactMatch = false) => {
    const isSelected = useExactMatch && currentUrl === item.to;

    return (
      <Button
        key={item.to}
        component={useExactMatch ? RouterLink : NavLink}
        to={item.to}
        onClick={onClose}
        color="inherit"
        sx={navButtonSx(isSelected)}
      >
        {item.label}
      </Button>
    );
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={(theme) => ({
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          bgcolor: theme.palette.custom.semantic.storeNavigation.bg,
          color: theme.palette.custom.semantic.storeNavigation.text,
        },
      })}
    >
      <Box sx={{ width: 300, p: 2 }}>
        <Typography
          variant="h5"
          sx={(theme) => ({ color: theme.palette.custom.semantic.storeNavigation.brandText, fontWeight: 600, letterSpacing: '0.16em' })}
        >
          Aliqora
        </Typography>

        <Typography
          variant="caption"
          sx={(theme) => ({ color: theme.palette.custom.semantic.storeNavigation.brandSubtext, mb: 2, display: 'block', letterSpacing: '0.18em', textTransform: 'uppercase' })}
        >
          Empaques
        </Typography>

        <Divider sx={(theme) => ({ mb: 2, borderColor: theme.palette.custom.semantic.storeNavigation.divider })} />

        <Stack spacing={1}>
          {mainMenuItems.map((item) => renderNavButton(item))}

          <Divider sx={(theme) => ({ my: 1, borderColor: theme.palette.custom.semantic.storeNavigation.divider })} />

          <Typography
            variant="caption"
            sx={(theme) => ({ px: 1, fontWeight: 800, color: theme.palette.custom.semantic.storeNavigation.brandText, textTransform: 'uppercase', letterSpacing: '0.16em' })}
          >
            Catálogo
          </Typography>

          {catalogMenuItems.map((item) => renderNavButton(item, true))}

          {afterCatalogMenuItems.length > 0 && (
            <>
              <Divider sx={(theme) => ({ my: 1, borderColor: theme.palette.custom.semantic.storeNavigation.divider })} />

              <Typography
                variant="caption"
                sx={(theme) => ({ px: 1, fontWeight: 800, color: theme.palette.custom.semantic.storeNavigation.brandText, textTransform: 'uppercase', letterSpacing: '0.16em' })}
              >
                Información
              </Typography>

              {afterCatalogMenuItems.map((item) => renderNavButton(item))}
            </>
          )}

          <Divider sx={(theme) => ({ my: 1, borderColor: theme.palette.custom.semantic.storeNavigation.divider })} />

          {isLoggedIn ? (
            <>
              <Typography
                variant="caption"
                sx={(theme) => ({ px: 1, fontWeight: 800, color: theme.palette.custom.semantic.storeNavigation.brandText, textTransform: 'uppercase', letterSpacing: '0.16em' })}
              >
                Mi cuenta
              </Typography>

              {renderNavButton({ label: 'Mi perfil', to: '/perfil' })}
              {renderNavButton({ label: 'Mis pedidos', to: '/mis-pedidos' })}
              {renderNavButton({ label: 'Mis cotizaciones', to: '/mis-cotizaciones' })}
              {renderNavButton({ label: 'Mis solicitudes', to: '/mis-solicitudes' })}
              {renderNavButton({ label: 'Mis direcciones', to: '/direcciones' })}

              {isInternalUser && (
                <>
                  <Divider sx={(theme) => ({ my: 1, borderColor: theme.palette.custom.semantic.storeNavigation.divider })} />
                  {renderNavButton({ label: 'Panel administrativo', to: '/admin' })}
                </>
              )}
            </>
          ) : (
            <>
              <Button component={NavLink} to="/login" onClick={onClose} variant="contained">
                Ingresar
              </Button>

              <Button
                component={NavLink}
                to="/registro"
                onClick={onClose}
                variant="outlined"
                sx={(theme) => ({
                  color: theme.palette.custom.semantic.storeNavigation.brandText,
                  borderColor: theme.palette.custom.semantic.storeNavigation.actionBorder,
                })}
              >
                Crear cuenta
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
};
