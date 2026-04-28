/**
 * Footer público de la tienda.
 */

import { Box, Container, Stack, Typography } from '@mui/material';

export const StoreFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: 6,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} ALIQORA Empaques
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Catálogo, pedidos, pagos y seguimiento en línea.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
