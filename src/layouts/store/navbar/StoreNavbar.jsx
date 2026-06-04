/**
 * Navbar público de la tienda.
 */

import { useEffect, useRef, useState } from 'react';

import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import {
  AccountCircle,
  CloseRounded,
  DarkMode,
  KeyboardArrowDown,
  LightMode,
  Menu,
} from '@mui/icons-material';

import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../../hooks/auth/useAuth';
import { useStoreSettings } from '../../../hooks/store/useStoreSettings';
import { useThemeMode } from '../../../providers/AppThemeProvider';

import { StoreCartButton } from './StoreCartButton';
import { StoreMobileDrawer } from './StoreMobileDrawer';
import { StoreUserMenu } from './StoreUserMenu';
import {
  storeAfterCatalogMenuItems,
  storeCatalogMenuItems,
  storeMainMenuItems,
} from './storeNavigationConfig';

import { StoreBrandLogo } from './StoreBrandLogo';

const getNavButtonSx = (isActive = false) => (theme) => {
  const nav = theme.palette.custom.semantic.storeNavigation;

  return {
    fontWeight: 700,
    color: isActive ? nav.brandText : nav.textMuted,
    borderRadius: theme.palette.custom.radius.sm,
    px: 1.5,
    bgcolor: isActive ? nav.activeBg : 'transparent',
    '&:hover': {
      color: nav.brandText,
      bgcolor: nav.hoverBg,
      transform: 'none',
      boxShadow: 'none',
    },
    '&.active': {
      color: nav.brandText,
      bgcolor: nav.activeBg,
    },
  };
};

export const StoreNavbar = () => {
  const location = useLocation();

  const { mode, toggleColorMode } = useThemeMode();
  const { user, roles, isAuthenticated } = useAuth();
  const { settings } = useStoreSettings();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [dismissedTopbarKey, setDismissedTopbarKey] = useState('');
  const closeTimerRef = useRef(null);

  const topbarText = settings.mensaje_topbar || settings.slogan || '';
  const topbarRightText = settings.metadata?.mensaje_topbar_derecha || '';
  const topbarDismissKey = `${topbarText}__${topbarRightText}`;
  const showTopbar =
    Boolean(topbarText || topbarRightText) && dismissedTopbarKey !== topbarDismissKey;

  const isLoggedIn = isAuthenticated ?? Boolean(user);
  const isCatalogActive = location.pathname === '/catalogo';
  const currentUrl = `${location.pathname}${location.search}`;

  useEffect(() => {
    try {
      setDismissedTopbarKey(sessionStorage.getItem('aliqora_topbar_dismissed_key') || '');
    } catch {
      setDismissedTopbarKey('');
    }
  }, []);

  const handleDismissTopbar = () => {
    setDismissedTopbarKey(topbarDismissKey);

    try {
      sessionStorage.setItem('aliqora_topbar_dismissed_key', topbarDismissKey);
    } catch {
      // sessionStorage puede no estar disponible en algunos entornos.
    }
  };

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
  const handleCloseCatalogMenu = () => setIsCatalogOpen(false);

  const scheduleCatalogClose = () => {
    closeTimerRef.current = setTimeout(() => setIsCatalogOpen(false), 250);
  };

  const cancelCatalogClose = () => clearTimeout(closeTimerRef.current);

  const handleCatalogEnter = () => {
    cancelCatalogClose();
    setIsCatalogOpen(true);
  };

  const renderMainNavButton = (item) => (
    <Button
      key={item.to}
      component={NavLink}
      to={item.to}
      color="inherit"
      sx={getNavButtonSx()}
    >
      {item.label}
    </Button>
  );

  return (
    <>
      {showTopbar && (
        <Box
          sx={(theme) => {
            const nav = theme.palette.custom.semantic.storeNavigation;

            return {
              borderBottom: `1px solid ${nav.border}`,
              bgcolor: nav.bg,
              color: nav.text,
            };
          }}
        >
          <Container maxWidth="xl">
            <Box
              sx={{
                py: 0.8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1.25,
              }}
            >
              <Typography
                variant="body2"
                sx={(theme) => ({
                  color: theme.palette.custom.semantic.storeNavigation.textMuted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: { xs: 'normal', md: 'nowrap' },
                })}
              >
                {topbarText}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                {topbarRightText && (
                  <Chip
                    label={topbarRightText}
                    size="small"
                    sx={(theme) => {
                      const nav = theme.palette.custom.semantic.storeNavigation;

                      return {
                        display: { xs: 'none', sm: 'inline-flex' },
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        bgcolor: alpha(nav.brandText, 0.12),
                        color: nav.brandText,
                        border: `1px solid ${alpha(nav.brandText, 0.18)}`,
                      };
                    }}
                  />
                )}

                <IconButton
                  size="small"
                  onClick={handleDismissTopbar}
                  aria-label="Cerrar aviso superior"
                  sx={(theme) => ({
                    color: theme.palette.custom.semantic.storeNavigation.textMuted,
                  })}
                >
                  <CloseRounded fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      <AppBar
        position="sticky"
        elevation={0}
        sx={(theme) => {
          const nav = theme.palette.custom.semantic.storeNavigation;

          return {
            borderBottom: `1px solid ${nav.border}`,
            bgcolor: nav.bg,
            color: nav.text,
          };
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
                onClick={handleDrawerToggle}
                sx={(theme) => ({
                  display: { xs: 'inline-flex', md: 'none' },
                  color: theme.palette.custom.semantic.storeNavigation.brandText,
                })}
                aria-label="Abrir menú"
              >
                <Menu />
              </IconButton>

              <Box
                component={NavLink}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                  textDecoration: 'none',
                }}
              >
                <StoreBrandLogo />
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

              <Box
                sx={{ position: 'relative' }}
                onMouseEnter={handleCatalogEnter}
                onMouseLeave={scheduleCatalogClose}
              >
                <Button
                  endIcon={
                    <KeyboardArrowDown
                      sx={{
                        transition: 'transform 200ms',
                        transform: isCatalogOpen ? 'rotate(180deg)' : 'none',
                      }}
                    />
                  }
                  sx={getNavButtonSx(isCatalogActive || isCatalogOpen)}
                >
                  Catálogo
                </Button>

                {isCatalogOpen && (
                  <Paper
                    elevation={0}
                    sx={(theme) => ({
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      mt: '4px',
                      minWidth: 200,
                      zIndex: theme.zIndex.modal,
                      boxShadow: theme.palette.custom.shadows.lg,
                    })}
                  >
                    <MenuList disablePadding sx={{ py: 0.75 }}>
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
                    </MenuList>
                  </Paper>
                )}
              </Box>

              {storeAfterCatalogMenuItems.map(renderMainNavButton)}
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
                size="small"
                aria-label="Cambiar tema"
                sx={(theme) => ({
                  color: theme.palette.custom.semantic.storeNavigation.brandText,
                })}
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
                    size="small"
                    sx={(theme) => ({
                      display: { xs: 'inline-flex', md: 'none' },
                      color: theme.palette.custom.semantic.storeNavigation.brandText,
                    })}
                    aria-label="Ingresar"
                  >
                    <AccountCircle />
                  </IconButton>

                  <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
                    <Button component={NavLink} to="/login" variant="contained" size="small" sx={{ minWidth: 'auto' }}>
                      Ingresar
                    </Button>

                    <Button
                      component={NavLink}
                      to="/registro"
                      variant="outlined"
                      size="small"
                      sx={(theme) => ({
                        minWidth: 'auto',
                        color: theme.palette.custom.semantic.storeNavigation.brandText,
                        borderColor: theme.palette.custom.semantic.storeNavigation.actionBorder,
                      })}
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
        afterCatalogMenuItems={storeAfterCatalogMenuItems}
        roles={roles}
        onClose={handleDrawerToggle}
      />
    </>
  );
};