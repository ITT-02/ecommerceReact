import React from 'react';
import { Box, ButtonBase, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import aliqoraLogo from '../../../assets/brand/aliqora-logo.png';

export const AdminBrandLogo = ({ collapsed = false }) => {
  return (
    <Tooltip title={collapsed ? 'Aliqora Empaques' : ''} placement="right">
      <ButtonBase
        component={RouterLink}
        to="/admin/dashboard"
        aria-label="Ir al dashboard administrativo"
        sx={{
          width: '100%',
          minHeight: collapsed ? 56 : 72,
          px: collapsed ? 1 : 2,
          py: 0.5,
          justifyContent: collapsed ? 'center' : 'flex-start',
          overflow: 'hidden',
          borderRadius: 3,
          transition: (theme) =>
            theme.transitions.create(['background-color', 'border-color'], {
              duration: theme.transitions.duration.shorter,
            }),
        }}
      >
        <Box
          component="img"
          src={aliqoraLogo}
          alt="Aliqora Empaques"
          sx={{
            display: 'block',
            width: collapsed ? 42 : '100%',
            maxWidth: collapsed ? 42 : 190,
            height: collapsed ? 42 : 50,
            objectFit: 'contain',
            objectPosition: collapsed ? 'center' : 'left center',
          }}
        />
      </ButtonBase>
    </Tooltip>
  );
};