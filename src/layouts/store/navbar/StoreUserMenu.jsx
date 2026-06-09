/**
 * Menú de usuario autenticado para la tienda pública.
 *
 * Incluye accesos de cliente y, cuando el usuario tiene rol interno,
 * acceso directo al panel administrativo.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import {
  Avatar,
  Box,
  Button,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Typography,
  alpha,
} from '@mui/material';

import { useAuth } from '../../../hooks/auth/useAuth';
import { getMainRole, hasInternalRole } from '../../../utils/access/menuByRole';

export const StoreUserMenu = () => {
  const navigate = useNavigate();
  const { profile, user, logout, roles = [] } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const isInternalUser = hasInternalRole(roles);
  const mainRole = getMainRole(roles);

  const fullNameFromParts = `${profile?.nombres || ''} ${profile?.apellidos || ''}`.trim();

  const displayName =
    profile?.nombre_completo ||
    fullNameFromParts ||
    user?.email ||
    'Usuario';

  const displayInitial = displayName.charAt(0).toUpperCase();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGoTo = (path) => {
    handleClose();
    navigate(path);
  };

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
  aria-label="Abrir menú de usuario"
  aria-controls={open ? 'store-user-menu' : undefined}
  aria-haspopup="true"
  aria-expanded={open ? 'true' : undefined}
  sx={{
    minWidth: 0,
    width: 'auto',
    maxWidth: '100%',
    flexShrink: 0,
    px: { xs: 0.25, md: 1 },
    py: 0.5,
    borderRadius: 999,
    textTransform: 'none',
    overflow: 'hidden',
    // Forzamos a que en reposo use el texto claro de la navegación y no el oscuro heredado
    color: (theme) => theme.palette.custom.semantic.storeNavigation.text,
    '&:hover': { 
      transform: 'none', 
      boxShadow: 'none',
      // Mantiene una respuesta visual limpia en hover usando tus tokens
      backgroundColor: (theme) => theme.palette.custom.semantic.storeNavigation.hoverBg,
    } 
  }}
>
  <Stack
    direction="row"
    spacing={{ xs: 0, md: 1 }}
    sx={{
      alignItems: 'center',
      minWidth: 0,
    }}
  >
    <Avatar
      sx={{
        width: { xs: 42, md: 34 },
        height: { xs: 42, md: 34 },
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 800,
        fontSize: { xs: '1rem', md: '0.95rem' },
        flexShrink: 0,
      }}
    >
      {displayInitial}
    </Avatar>

    <Stack
      sx={{
        display: { xs: 'none', md: 'flex' },
        minWidth: 0,
        textAlign: 'left',
      }}
    >
      {/* Nombre del Usuario: Blanco marfil / claro */}
      <Typography
        variant="subtitle2"
        noWrap
        sx={{
          maxWidth: 140,
          fontWeight: 700,
          lineHeight: 1.2,
          // Apunta directamente al color claro diseñado para esta barra
          color: (theme) => theme.palette.custom.semantic.storeNavigation.text, 
        }}
      >
        {displayName}
      </Typography>

      {/* Rol del Usuario: El color gris claro/sutil que buscabas en este fondo */}
      <Typography
        variant="caption"
        noWrap
        sx={{
          maxWidth: 140,
          lineHeight: 1.2,
          // Apunta a tu gris con opacidad del 76% sobre fondo oscuro (alpha(colors.warm.ivory, 0.76))
          color: (theme) => theme.palette.custom.semantic.storeNavigation.textMuted, 
        }}
      >
        {mainRole}
      </Typography>
    </Stack>

    {/* Icono de flecha: Mismo gris claro/sutil */}
    <KeyboardArrowDownIcon
      fontSize="small"
      sx={{
        display: { xs: 'none', md: 'block' },
        flexShrink: 0,
        color: (theme) => theme.palette.custom.semantic.storeNavigation.textMuted, 
      }}
    />
  </Stack>
</Button>

      <Menu
        id="store-user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 220,
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: (theme) =>
                `0 18px 45px ${alpha(theme.palette.common.black, 0.14)}`,
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 800, color: 'text.primary' }}
          >
            {displayName}
          </Typography>

          <Typography
            variant="caption"
            noWrap
            sx={{ display: 'block', color: 'text.secondary' }}
          >
            {user?.email || profile?.email || profile?.correo || 'Correo no registrado'}
          </Typography>
        </Box>

        <Divider />

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

        <MenuItem onClick={() => handleGoTo('/mis-cotizaciones')}>
          <ListItemIcon>
            <RequestQuoteOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Mis cotizaciones
        </MenuItem>

        <MenuItem onClick={() => handleGoTo('/mis-solicitudes')}>
          <ListItemIcon>
            <AssignmentTurnedInOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Mis solicitudes
        </MenuItem>

        <MenuItem onClick={() => handleGoTo('/direcciones')}>
          <ListItemIcon>
            <HomeWorkOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Mis direcciones
        </MenuItem>

        {isInternalUser && [
          <Divider key="admin-divider" />,
          <MenuItem
            key="admin-panel"
            onClick={() => handleGoTo('/admin')}
          >
            <ListItemIcon>
              <AdminPanelSettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Panel administrativo
          </MenuItem>,
        ]}

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            color: 'error.main',
            fontWeight: 800,
            '& .MuiListItemIcon-root': {
              color: 'error.main',
            },
            '&:hover': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }}
        >
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
};