/**
 * Menú de usuario autenticado para la tienda pública.
 *
 * Vive dentro de navbar/ porque se abre desde el navbar público.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  Avatar,
  Button,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';

import { useAuth } from '../../../hooks/auth/useAuth';
import { getMainRole, hasInternalRole } from '../../../utils/access/menuByRole';

export const StoreUserMenu = () => {
  const navigate = useNavigate();
  const { profile, user, logout, roles } = useAuth();
  const isInternalUser = hasInternalRole(roles);
  const mainRole = getMainRole(roles);
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
      <Button
        onClick={(event) => setAnchorEl(event.currentTarget)}
        color="inherit"
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        aria-label="Abrir menú de usuario"
        sx={{ minWidth: 'auto', px: 1, py: 0.5, borderRadius: 2, textTransform: 'none' }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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

          {/* Nombre y rol — solo en desktop */}
          <Stack sx={{ display: { xs: 'none', md: 'flex' }, textAlign: 'left' }}>
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {mainRole}
            </Typography>
          </Stack>
        </Stack>
      </Button>

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

        {isInternalUser && (
          <>
            <Divider />
            <MenuItem onClick={() => handleGoTo('/admin/dashboard')}>
              <ListItemIcon>
                <AdminPanelSettingsIcon fontSize="small" />
              </ListItemIcon>
              Volver al panel administrativo
            </MenuItem>
          </>
        )}

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
