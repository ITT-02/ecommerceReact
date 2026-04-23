import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Button,
  Stack,
  CardMedia,
} from '@mui/material';

export const CardsSection = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 1 }}>
          Cards
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Ejemplos de tarjetas para productos y resumen.
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardMedia
                component="img"
                height="180"
                image="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=800&auto=format&fit=crop"
                alt="producto"
              />
              <CardContent>
                <Typography variant="h5">Anillo elegante</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Oro 18k con detalle premium
                </Typography>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  S/ 1,250.00
                </Typography>
                <Button variant="contained" color="primary" fullWidth>
                  Ver detalles
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h5">Resumen</Typography>
                  <Typography color="text.secondary">Productos activos</Typography>
                  <Typography variant="h3">128</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                p: 3,
                borderRadius: 4,
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                height: '100%',
              }}
            >
              <Typography variant="h5" sx={{ mb: 1 }}>
                Box estilizado
              </Typography>
              <Typography color="text.secondary">
                También puedes combinar MUI con Box y sx.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};