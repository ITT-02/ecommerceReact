/**
 * Item reutilizable para acciones del sidebar/drawer administrativo.
 *
 */

import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

import { NavLink } from 'react-router-dom';

const getActionTone = (theme, tone) => {
  const nav = theme.palette.custom.semantic.adminNavigation;

  if (tone === 'danger') {
    return {
      color: nav.actionDanger,
      hoverBg: nav.actionDangerBg,
    };
  }

  return {
    color: nav.itemText,
    hoverBg: nav.itemHoverBg,
  };
};

export const AdminActionItem = ({
  label,
  icon,
  to,
  onClick,
  tone = 'default',
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
      sx={(theme) => {
        const actionTone = getActionTone(theme, tone);

        return {
          borderRadius: theme.palette.custom.radius.md,
          color: actionTone.color,
          textDecoration: 'none',
          justifyContent: label ? 'flex-start' : 'center',
          '&:hover': {
            bgcolor: actionTone.hoverBg,
            color: actionTone.color,
          },
        };
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: minWidthIcon,
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        {icon}
      </ListItemIcon>

      {label && (
        <ListItemText
          primary={
            <Typography component="span" sx={{ color: 'inherit', fontSize: 14, fontWeight: 600 }}>
              {label}
            </Typography>
          }
        />
      )}
    </ListItemButton>
  );
};
