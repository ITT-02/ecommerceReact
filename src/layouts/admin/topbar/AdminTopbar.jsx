/**
 * Barra superior del panel administrativo.
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

import {
  DarkMode,
  LightMode,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

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
      sx={(theme) => ({
        bgcolor: theme.palette.custom.semantic.appBar,
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(12px)',
      })}
    >
      <Toolbar sx={{ gap: 1, px: { xs: 0, md: 3 }, minHeight: { xs: 64, md: 72 } }}>
        <IconButton
          onClick={onOpenMobileMenu}
          sx={{ display: { xs: 'inline-flex', lg: 'none' } }}
          aria-label="Abrir menú"
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            component="div"
            variant="h6"
            sx={{
              fontWeight: 900,
              lineHeight: { xs: 1.05, sm: 1.2 },
              letterSpacing: { xs: '0.04em', sm: '0.02em' },
              color: 'text.primary',
              textTransform: 'uppercase',
            }}
          >
              Panel administrativo
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{
              display: { xs: 'none', md: 'block' },
              mt: 0.25,
            }}
          >
            Centro administrativo del sistema
          </Typography>
        </Box>

        <IconButton onClick={onToggleTheme} color="primary" aria-label="Cambiar tema">
          {mode === 'light' ? <DarkMode /> : <LightMode />}
        </IconButton>

        <Button
          onClick={onOpenAccountMenu}
          color="inherit"
          endIcon={<KeyboardArrowDownIcon fontSize="small" />}
          sx={{
            minWidth: 'auto',
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            textTransform: 'none',
            '&:hover': { transform: 'none' },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 36, height: 36 }}>
              {user?.nombreCompleto?.[0]?.toUpperCase() || 'I'}
            </Avatar>

            <Stack sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {user?.nombreCompleto || 'Invitado'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.rol || 'Administrador'}
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