// Página pública Nosotros.
// Presenta la empresa, su propuesta de valor y líneas principales de productos.

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const values = [
  {
    title: 'Empaques funcionales',
    description: 'Cajas y bolsas pensadas para envíos, e-commerce, pizza, textil y línea joyería.',
    icon: Inventory2Icon,
  },
  {
    title: 'Atención personalizada',
    description: 'Acompañamiento para elegir medidas, presentación y opciones adecuadas para cada negocio.',
    icon: WorkspacePremiumIcon,
  },
  {
    title: 'Proceso claro de compra',
    description: 'Catálogo, carrito, pedido, pago y seguimiento desde una sola plataforma.',
    icon: LocalShippingIcon,
  },
];

export const AboutPage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
      <Grid container spacing={4} sx={{ alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2.5}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>
              Nosotros
            </Typography>

            <Typography variant="h2">
              Aliqora Empaques
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button component={RouterLink} to="/catalogo" variant="contained" size="large">
                Ver catálogo
              </Button>
              <Button component={RouterLink} to="/registro" variant="outlined" size="large">
                Crear cuenta
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 5 }}>
        <Grid container spacing={2.5}>
          {values.map((item) => {
            const Icon = item.icon;
            return (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'action.selected',
                          color: 'primary.dark',
                        }}
                      >
                        <Icon />
                      </Box>
                      <Typography variant="h5">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
};
