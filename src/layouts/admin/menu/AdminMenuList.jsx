/**
 * Lista del menú administrativo.
 *
 * Responsabilidad:
 * - Renderizar los grupos definidos en adminMenuConfig.js.
 * - Mostrar versión expandida o colapsada.
 * - No conoce autenticación ni lógica de roles; recibe el menú ya filtrado.
 */

import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';

import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const getInitialOpenGroups = (groups) => {
  return groups.reduce((acc, group, index) => {
    acc[group.title] = index === 0;
    return acc;
  }, {});
};

const menuItemSx = {
  borderRadius: 3,
  color: 'text.primary',
  textDecoration: 'none',

  '&.active': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
  },

  '&.active .MuiListItemIcon-root': {
    color: 'primary.contrastText',
  },
};

export const AdminMenuList = ({
  groups = [],
  collapsed = false,
  onItemClick,
}) => {
 
  const [openGroupTitle, setOpenGroupTitle] = useState(() => 
    groups[0]?.title ?? null
  );

  const flatItems = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );

  
  const toggleGroup = (groupTitle) => {
    setOpenGroupTitle((prev) => (prev === groupTitle ? null : groupTitle));
  };

  if (collapsed) {
    return (
      <List disablePadding sx={{ px: 0.5 }}>
        {flatItems.map((item) => {
          const Icon = item.icon;

          return (
            <Tooltip key={item.path} title={item.label} placement="right">
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onItemClick}
                sx={{
                  ...menuItemSx,
                  mb: 0.75,
                  minHeight: 44,
                  justifyContent: 'center',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    color: 'text.secondary',
                    justifyContent: 'center',
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    );
  }

  return (
    <Box sx={{ overflowY: 'auto', pr: 0.5 }}>
      {groups.map((group) => {
        const isOpen = openGroupTitle === group.title;

        return (
          <Box key={group.title} sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => toggleGroup(group.title)}
              sx={{
                borderRadius: 2,
                px: 1.5,
                py: 1,
              }}
            >
              <ListItemText
                primary={
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 0.6,
                    }}
                  >
                    {group.title}
                  </Typography>
                }
              />

              {isOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </ListItemButton>

            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List disablePadding>
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <ListItemButton
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      onClick={onItemClick}
                      sx={{
                        ...menuItemSx,
                        mt: 0.5,
                        pl: 2,
                        pr: 1.5,
                        py: 1.15,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography component="span" sx={{ fontSize: 15, fontWeight: 600 }}>
                            {item.label}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Collapse>
          </Box>
        );
      })}
    </Box>
  );
};
