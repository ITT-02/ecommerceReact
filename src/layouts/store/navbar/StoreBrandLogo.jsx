import React from 'react';
import { Box } from '@mui/material';

import aliqoraLogo from '../../../assets/brand/aliqora-logo.png';

export const StoreBrandLogo = () => {
  return (
    <Box
      component="img"
      src={aliqoraLogo}
      alt="Aliqora Empaques"
      sx={{
        display: 'block',
        width: 'auto',
        height: {
          xs: 42,
          sm: 48,
          md: 54,
        },
        maxWidth: {
          xs: 150,
          sm: 180,
          md: 210,
        },
        objectFit: 'contain',
      }}
    />
  );
};