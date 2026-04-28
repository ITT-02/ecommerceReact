// Pantalla de carga reutilizable.

import { Box, CircularProgress, Typography } from '@mui/material';

export const LoadingScreen = ({ message = 'Cargando...' }) => {
  return (
    <Box sx={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">{message}</Typography>
      </Box>
    </Box>
  );
};
