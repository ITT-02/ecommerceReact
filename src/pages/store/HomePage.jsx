// Página de inicio pública.
// Presenta la propuesta de valor y accesos rápidos a catálogo y nosotros.

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const highlights = [
  { title: 'Cajas', description: 'Opciones para envío, e-commerce, pizza y presentación.' },
  { title: 'Bolsas', description: 'Bolsas para envío' },
  { title: 'Pagos y seguimiento', description: 'Compra, adjunta comprobante y revisa el avance de tu pedido.' },
];

export const HomePage = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>

      <Box sx={{ mt: 5 }}>
        <Grid container spacing={2.5}>
          {highlights.map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};
