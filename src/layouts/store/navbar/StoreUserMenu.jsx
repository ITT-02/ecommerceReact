/**
 * Menú de usuario autenticado para la tienda pública.
 *
 * Vive dentro de navbar/ porque se abre desde el navbar público.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  Avatar,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
} from '@mui/material';

import { useAuth } from '../../../hooks/auth/useAuth';

export const StoreUserMenu = () => {
  const navigate = useNavigate();
  const { profile, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const fullNameFromParts = `${profile?.nombres || ''} ${
    profile?.apellidos || ''
  }`.trim();

  const displayName =
    profile?.nombre_completo || fullNameFromParts || user?.email || 'Usuario';

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGoTo = (path) => {
    handleClose();
    navigate(path);
  };

  /**
 * Cierra sesión desde la tienda.
 *
 * Primero cierra el menú.
 * Luego intenta cerrar sesión en la API externa.
 * Finalmente redirige al login aunque la API rechace el logout.
 */
const handleLogout = async () => {
  handleClose();

  try {
    await logout();
  } finally {
    navigate('/login', { replace: true });
  }
};

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Abrir menú de usuario"
      >
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </Avatar>
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleGoTo('/perfil')}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>

        <MenuItem onClick={() => handleGoTo('/mis-pedidos')}>
          <ListItemIcon>
            <ReceiptLongIcon fontSize="small" />
          </ListItemIcon>
          Mis pedidos
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
};
