/**
 * Layout público de la tienda.
 *
 * Responsabilidad:
 * - Mostrar navbar público.
 * - Renderizar contenido con Outlet.
 * - Mostrar footer.
 */

import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { StoreFooter } from './footer/StoreFooter';
import { StoreNavbar } from './navbar/StoreNavbar';

export const StoreLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <StoreNavbar />

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      <StoreFooter />
    </Box>
  );
};
