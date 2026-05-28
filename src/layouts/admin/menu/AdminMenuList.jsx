/**
 * Lista del menú administrativo.
 *
 * Los colores no se definen en el componente. Se consumen desde
 * theme.palette.custom.semantic.adminNavigation para mantener el diseño
 * centralizado en el theme de Aliqora.
 */

import { useMemo, useState } from 'react';
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

const getAdminNavigation = (theme) => theme.palette.custom.semantic.adminNavigation;

const getMenuItemSx = (theme, collapsed = false) => {
  const nav = getAdminNavigation(theme);

  return {
    borderRadius: theme.palette.custom.radius.xs,
    color: nav.itemText,
    textDecoration: 'none',
    mx: collapsed ? 0 : 0.25,
    '& .MuiListItemIcon-root': {
      color: nav.itemIcon,
    },
    '&:hover': {
      bgcolor: nav.itemHoverBg,
      color: nav.itemHoverText,
      '& .MuiListItemIcon-root': { color: nav.itemActiveText },
    },
    '&.active': {
      bgcolor: nav.itemActiveBg,
      color: nav.itemActiveText,
      borderLeft: collapsed ? 0 : 2,
      borderColor: nav.itemActiveText,
      '& .MuiListItemIcon-root': { color: nav.itemActiveText },
    },
  };
};

export const AdminMenuList = ({ groups = [], collapsed = false, onItemClick }) => {
  const [openGroupTitle, setOpenGroupTitle] = useState(() => groups[0]?.title ?? null);

  const flatItems = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  const toggleGroup = (groupTitle) => {
    setOpenGroupTitle((prev) => (prev === groupTitle ? null : groupTitle));
  };

  if (collapsed) {
    return (
      <List disablePadding sx={{ px: 0.5 }}>
        {flatItems.map((item) => {
          const Icon = item.icon;

          return (
            <Tooltip key={item.path} title={item.label} placement="right" arrow>
              <ListItemButton
                component={NavLink}
                to={item.path}
                onClick={onItemClick}
                sx={(theme) => ({
                  ...getMenuItemSx(theme, true),
                  mb: 0.75,
                  minHeight: 44,
                  justifyContent: 'center',
                })}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
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
        const GroupIcon = group.icon;

        return (
          <Box key={group.title} sx={{ mb: 1.25 }}>
            <ListItemButton
              onClick={() => toggleGroup(group.title)}
              sx={(theme) => {
                const nav = getAdminNavigation(theme);

                return {
                  borderRadius: theme.palette.custom.radius.xs,
                  px: 1.5,
                  py: 1,
                  color: nav.groupTextMuted,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  '&:hover': {
                    bgcolor: nav.groupHoverBg,
                  },
                };
              }}
            >
              {GroupIcon && (
                <Box
                  sx={(theme) => {
                    const nav = getAdminNavigation(theme);

                    return {
                      width: 28,
                      height: 28,
                      minWidth: 28,
                      borderRadius: theme.palette.custom.radius.xs,
                      display: 'grid',
                      placeItems: 'center',
                      color: nav.groupText,
                      bgcolor: nav.groupHoverBg,
                    };
                  }}
                >
                  <GroupIcon sx={{ fontSize: 18 }} />
                </Box>
              )}

              <Typography
                component="span"
                variant="caption"
                sx={(theme) => ({
                  flex: 1,
                  minWidth: 0,
                  color: getAdminNavigation(theme).groupText,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  lineHeight: 1.2,
                })}
              >
                {group.title}
              </Typography>

              {isOpen ? (
                <ExpandLessIcon
                  fontSize="small"
                  sx={{
                    color: 'inherit',
                    flexShrink: 0,
                  }}
                />
              ) : (
                <ExpandMoreIcon
                  fontSize="small"
                  sx={{
                    color: 'inherit',
                    flexShrink: 0,
                  }}
                />
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
                      sx={(theme) => ({
                        ...getMenuItemSx(theme, false),
                        mt: 0.5,
                        pl: 2,
                        pr: 1.5,
                        py: 1.1,
                      })}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography
                            component="span"
                            sx={{
                              color: 'inherit',
                              fontSize: 14,
                              fontWeight: 500,
                            }}
                          >
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
