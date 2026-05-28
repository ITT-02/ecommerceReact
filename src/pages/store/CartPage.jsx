// Carrito de compras del cliente.

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Box, Button, Card, CardContent, Container, Divider, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useCart } from '../../hooks/sales/useCart';
import { formatCurrency } from '../../utils/formatters';

export const CartPage = () => {
  const { cart, items, loading, saving, error, updateItem, removeItem } = useCart();

  if (loading) return <LoadingScreen message="Cargando carrito..." />;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main">Compra</Typography>
          <Typography variant="h2">Carrito</Typography>
        </Box>

        <ErrorMessage message={error} />

        {!items.length ? (
          <EmptyState title="Tu carrito está vacío" description="Agrega productos desde el catálogo para continuar." actionLabel="Ver catálogo" actionTo="/catalogo" />
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1.5}>
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
                        <Box component="img" src={item.imagen_url || 'https://placehold.co/160x120?text=Aliqora'} alt={item.nombre_producto} sx={{ width: { xs: '100%', sm: 112 }, height: 92, objectFit: 'cover', borderRadius: 2, bgcolor: 'action.selected' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1">{item.nombre_producto}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.nombre_variante || item.codigoproducto}</Typography>
                          {item.requiere_abastecimiento && <Typography variant="caption" color="warning.main">Compra bajo pedido</Typography>}
                        </Box>
                        <TextField
                          label="Cant."
                          type="number"
                          size="small"
                          value={item.cantidad}
                          onChange={(event) => updateItem(item.id, Math.max(1, Number(event.target.value || 1)))}
                          disabled={saving}
                          sx={{ width: 96 }}
                          slotProps={{ htmlInput: { min: 1 } }}
                        />
                        <Typography variant="subtitle1" sx={{ minWidth: 100, textAlign: { sm: 'right' } }}>{formatCurrency(item.total_linea)}</Typography>
                        <IconButton color="error" onClick={() => removeItem(item.id)} disabled={saving} aria-label="Eliminar item">
                          <DeleteOutlineOutlinedIcon />
                        </IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ position: { md: 'sticky' }, top: 96 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h5">Resumen</Typography>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Subtotal</Typography>
                      <Typography fontWeight={800}>{formatCurrency(cart.subtotal)}</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="h6">Total</Typography>
                      <Typography variant="h6" color="secondary.main">{formatCurrency(cart.total)}</Typography>
                    </Stack>
                    <Button component={RouterLink} to="/checkout" variant="contained" size="large" fullWidth>
                      Continuar checkout
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>
    </Container>
  );
};
