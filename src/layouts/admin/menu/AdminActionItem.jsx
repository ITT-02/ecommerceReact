/**
 * Item reutilizable para acciones del sidebar/drawer administrativo.
 *
 * Ejemplos:
 * - Cerrar sesión.
 * - Ir a tienda.
 * - Acción adicional del layout.
 */

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

import { NavLink } from 'react-router-dom';

export const AdminActionItem = ({
  label,
  icon,
  to,
  onClick,
  color,
  minWidthIcon = 40,
}) => {
  const buttonProps = to
    ? {
        component: NavLink,
        to,
      }
    : {
        component: 'button',
        type: 'button',
      };

  return (
    <ListItemButton
      {...buttonProps}
      onClick={onClick}
      sx={{
        borderRadius: 3,
        color: color || 'text.primary',
        textDecoration: 'none',
        justifyContent: label ? 'flex-start' : 'center',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: minWidthIcon,
          color: color || 'text.secondary',
          justifyContent: 'center',
        }}
      >
        {icon}
      </ListItemIcon>

      {label && (
        <ListItemText
          primary={
            <Typography component="span" sx={{ fontSize: 14, fontWeight: 600 }}>
              {label}
            </Typography>
          }
        />
      )}
    </ListItemButton>
  );
};
