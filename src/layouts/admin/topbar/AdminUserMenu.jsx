/**
 * Menú de usuario del panel administrativo.
 *
 * Vive dentro de topbar/ porque se abre desde el avatar de la barra superior.
 */

import {
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';

import {
  DarkMode,
  LightMode,
  Logout,
  Storefront,
} from '@mui/icons-material';

import { NavLink } from 'react-router-dom';

export const AdminUserMenu = ({
  user,
  mode,
  anchorEl,
  open,
  onClose,
  onToggleTheme,
  onLogout,
}) => {
  const handleToggleTheme = () => {
    onToggleTheme();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box sx={{ px: 2, py: 1.5, minWidth: 230 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
          {user?.nombreCompleto || 'Usuario'}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {user?.email || 'Sin correo'}
        </Typography>
        <Typography variant="caption" color="primary.main" sx={{ display: 'block' }}>
          {user?.rol?.[0]?.toUpperCase() + user?.rol?.slice(1) || 'Sin rol'}
        </Typography>
      </Box>

      <Divider />

      <MenuItem component={NavLink} to="/" onClick={onClose}>
        <ListItemIcon>
          <Storefront fontSize="small" />
        </ListItemIcon>
        Ir a tienda
      </MenuItem>

      <MenuItem onClick={handleToggleTheme}>
        <ListItemIcon>
          {mode === 'light' ? (
            <DarkMode fontSize="small" />
          ) : (
            <LightMode fontSize="small" />
          )}
        </ListItemIcon>
        Modo {mode === 'light' ? 'oscuro' : 'claro'}
      </MenuItem>

      <Divider />

      <MenuItem onClick={onLogout} sx={{ color: 'error.main' }}>
        <ListItemIcon sx={{ color: 'error.main' }}>
          <Logout fontSize="small" />
        </ListItemIcon>
        Cerrar sesión
      </MenuItem>
    </Menu>
  );
};
