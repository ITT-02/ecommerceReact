/**
 * Barra superior del panel administrativo.
 *
 * Responsabilidad:
 * - Abrir el menú móvil.
 * - Mostrar título/contexto del panel.
 * - Cambiar tema.
 * - Abrir menú de usuario.
 */

import {
  Stack,
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';

import { DarkMode, LightMode, KeyboardArrowDown as KeyboardArrowDownIcon, Menu as MenuIcon } from '@mui/icons-material';

import { AdminUserMenu } from './AdminUserMenu';

export const AdminTopbar = ({
  user,
  mode,
  accountAnchorEl,
  onOpenMobileMenu,
  onOpenAccountMenu,
  onCloseAccountMenu,
  onToggleTheme,
  onLogout,
}) => {
  const isAccountMenuOpen = Boolean(accountAnchorEl);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <IconButton
          onClick={onOpenMobileMenu}
          sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>
            Panel administrativo
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Gestión de catálogo, ventas e inventario
          </Typography>
        </Box>

        <IconButton onClick={onToggleTheme} color="primary" aria-label="Cambiar tema">
          {mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>

        <Button 
          onClick={onOpenAccountMenu}
          color="inherit"
          sx={{ textTransform: 'none', textAlign: 'left', p: 0.5 }}
          endIcon={<KeyboardArrowDownIcon />}
        >
          <Stack direction="row" spacing={1} align-items="center">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              {user?.nombreCompleto?.[0]?.toUpperCase() || 'I'}
            </Avatar>
            
            {/* Stack vertical para el nombre y cargo */}
            <Stack spacing={0}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                {user?.nombreCompleto || 'Usuario'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.rol?.[0]?.toUpperCase() + user?.rol?.slice(1) || 'Sin rol'}
              </Typography>
            </Stack>
          </Stack>
        </Button>

        <AdminUserMenu
          user={user}
          mode={mode}
          anchorEl={accountAnchorEl}
          open={isAccountMenuOpen}
          onClose={onCloseAccountMenu}
          onToggleTheme={onToggleTheme}
          onLogout={onLogout}
        />
      </Toolbar>
    </AppBar>
  );
};
