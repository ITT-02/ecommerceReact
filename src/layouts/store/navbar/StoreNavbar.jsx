/**
 * Navbar público de la tienda.
 *
 * Responsabilidad:
 * - Mostrar marca.
 * - Mostrar navegación desktop.
 * - Mostrar menú de catálogo.
 * - Mostrar acciones de sesión/carrito/tema.
 * - Abrir drawer móvil.
 */

import { useState } from 'react';

import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import {
  AccountCircle,
  DarkMode,
  KeyboardArrowDown,
  LightMode,
  Menu,
} from '@mui/icons-material';

import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../../hooks/auth/useAuth';
import { useThemeMode } from '../../../providers/AppThemeProvider';

import { StoreCartButton } from './StoreCartButton';
import { StoreMobileDrawer } from './StoreMobileDrawer';
import { StoreUserMenu } from './StoreUserMenu';
import {
  storeCatalogMenuItems,
  storeMainMenuItems,
} from './storeNavigationConfig';

export const StoreNavbar = () => {
  const location = useLocation();

  const { mode, toggleColorMode } = useThemeMode();
  const { user, isAuthenticated } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogAnchorEl, setCatalogAnchorEl] = useState(null);

  const isLoggedIn = isAuthenticated ?? Boolean(user);
  const isCatalogOpen = Boolean(catalogAnchorEl);
  const isCatalogActive = location.pathname === '/catalogo';
  const currentUrl = `${location.pathname}${location.search}`;

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleOpenCatalogMenu = (event) => {
    setCatalogAnchorEl(event.currentTarget);
  };

  const handleCloseCatalogMenu = () => {
    setCatalogAnchorEl(null);
  };

  const renderMainNavButton = (item) => (
    <Button
      key={item.to}
      component={NavLink}
      to={item.to}
      color="inherit"
      sx={{
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

  return (
    <>
      <Box
        sx={(theme) => ({
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.custom.semantic.primarySofter,
        })}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              py: 1.2,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Empaques premium para cajas, bolsas y presentación de marca
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Envíos rápidos" size="small" />
              <Chip label="Atención personalizada" size="small" />
            </Box>
          </Box>
        </Container>
      </Box>

      <AppBar
        position="sticky"
        elevation={0}
        color="inherit"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
          <Container
            maxWidth="xl"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                color="primary"
                onClick={handleDrawerToggle}
                sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                aria-label="Abrir menú"
              >
                <Menu />
              </IconButton>

              <Box component={NavLink} to="/" sx={{ textDecoration: 'none' }}>
                <Typography
                  variant="h4"
                  color="primary.main"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.35rem', sm: '1.8rem' },
                  }}
                >
                  Aliqora
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Empaques
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {storeMainMenuItems.map(renderMainNavButton)}

              <Button
                onClick={handleOpenCatalogMenu}
                endIcon={<KeyboardArrowDown />}
                sx={{
                  color: isCatalogActive ? 'primary.main' : 'text.primary',
                  fontWeight: isCatalogActive ? 800 : 600,
                }}
              >
                Catálogo
              </Button>

              <MuiMenu
                anchorEl={catalogAnchorEl}
                open={isCatalogOpen}
                onClose={handleCloseCatalogMenu}
              >
                {storeCatalogMenuItems.map((item) => (
                  <MenuItem
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    onClick={handleCloseCatalogMenu}
                    selected={currentUrl === item.to}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </MuiMenu>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.5, sm: 1 },
                flexShrink: 0,
              }}
            >
              <StoreCartButton />

              <IconButton
                onClick={toggleColorMode}
                color="primary"
                size="small"
                aria-label="Cambiar tema"
              >
                {mode === 'light' ? <DarkMode /> : <LightMode />}
              </IconButton>

              {isLoggedIn ? (
                <StoreUserMenu />
              ) : (
                <>
                  <IconButton
                    component={NavLink}
                    to="/login"
                    color="primary"
                    size="small"
                    sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                    aria-label="Ingresar"
                  >
                    <AccountCircle />
                  </IconButton>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ display: { xs: 'none', md: 'flex' } }}
                  >
                    <Button
                      component={NavLink}
                      to="/login"
                      variant="contained"
                      size="small"
                      sx={{ minWidth: 'auto' }}
                    >
                      Ingresar
                    </Button>

                    <Button
                      component={NavLink}
                      to="/registro"
                      variant="outlined"
                      size="small"
                      sx={{ minWidth: 'auto' }}
                    >
                      Crear cuenta
                    </Button>
                  </Stack>
                </>
              )}
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      <StoreMobileDrawer
        open={mobileOpen}
        isLoggedIn={isLoggedIn}
        currentUrl={currentUrl}
        mainMenuItems={storeMainMenuItems}
        catalogMenuItems={storeCatalogMenuItems}
        onClose={handleDrawerToggle}
      />
    </>
  );
};
