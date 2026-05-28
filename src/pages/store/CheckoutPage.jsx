// Checkout del cliente.
// El checkout crea el pedido. El comprobante se registra después desde el detalle del pedido.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useCart } from '../../hooks/sales/useCart';
import { useStoreProfile } from '../../hooks/store/useStoreProfile';
import { useActiveStorePaymentMethods, useCheckout } from '../../hooks/store/useStoreOrders';
import { formatCurrency } from '../../utils/formatters';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, items, loading: loadingCart } = useCart();
  const { addresses, loading: loadingProfile } = useStoreProfile();
  const { methods, loading: loadingMethods, error: methodsError } = useActiveStorePaymentMethods();
  const { createOrder, creating, error } = useCheckout();

  const [direccionId, setDireccionId] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [notasCliente, setNotasCliente] = useState('');
  const [notice, setNotice] = useState('');

  const loading = loadingCart || loadingProfile || loadingMethods;

  const selectedMethod = useMemo(
    () => methods.find((method) => method.nombre === metodoPago) || null,
    [methods, metodoPago]
  );

  useEffect(() => {
    if (!metodoPago && methods.length) {
      setMetodoPago(methods[0].nombre);
    }
  }, [methods, metodoPago]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const pedidoId = await createOrder({
      direccionId: direccionId || null,
      metodoPago: metodoPago || null,
      notasCliente,
    });

    setNotice('Pedido creado correctamente. Ahora puedes registrar tu pago desde el detalle.');
    navigate(`/mis-pedidos/${pedidoId}`);
  };

  if (loading) return <LoadingScreen message="Preparando checkout..." />;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="primary.main">
              Confirmación
            </Typography>
            <Typography variant="h2">Checkout</Typography>
          </Box>

          <ErrorMessage message={error || methodsError} />
          {notice && <Alert severity="success">{notice}</Alert>}

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h5">Dirección de entrega</Typography>

                      <TextField
                        select
                        fullWidth
                        label="Dirección"
                        value={direccionId}
                        onChange={(event) => setDireccionId(event.target.value)}
                      >
                        <MenuItem value="">Usar dirección principal / coordinar entrega</MenuItem>
                        {addresses.map((address) => (
                          <MenuItem key={address.id} value={address.id}>
                            {address.alias || address.direccion_linea} · {address.distrito || 'Sin distrito'}
                          </MenuItem>
                        ))}
                      </TextField>

                      <Typography variant="caption" color="text.secondary">
                        Puedes gestionar tus direcciones desde Mi perfil.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h5">Método de pago preferido</Typography>

                      <Alert severity="info">
                        Aquí eliges el método que usarás. El comprobante se sube después de crear el
                        pedido, desde la pantalla de seguimiento.
                      </Alert>

                      <TextField
                        select
                        fullWidth
                        label="Método de pago"
                        value={metodoPago}
                        onChange={(event) => setMetodoPago(event.target.value)}
                      >
                        {methods.map((method) => (
                          <MenuItem key={method.id} value={method.nombre}>
                            {method.nombre}
                          </MenuItem>
                        ))}
                      </TextField>

                      {selectedMethod && (
                        <Card variant="outlined">
                          <CardContent>
                            <Stack spacing={1}>
                              <Typography fontWeight={800}>{selectedMethod.nombre}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Tipo: {selectedMethod.tipo} · Moneda: {selectedMethod.moneda || 'PEN'}
                              </Typography>
                              {selectedMethod.titular && (
                                <Typography variant="body2">Titular: {selectedMethod.titular}</Typography>
                              )}
                              {selectedMethod.numero_cuenta && (
                                <Typography variant="body2">
                                  Cuenta: {selectedMethod.numero_cuenta}
                                </Typography>
                              )}
                              {selectedMethod.telefono && (
                                <Typography variant="body2">Teléfono: {selectedMethod.telefono}</Typography>
                              )}
                              {selectedMethod.instrucciones && (
                                <Typography variant="body2" color="text.secondary">
                                  {selectedMethod.instrucciones}
                                </Typography>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      )}

                      <TextField
                        multiline
                        minRows={3}
                        label="Notas para el pedido"
                        value={notasCliente}
                        onChange={(event) => setNotasCliente(event.target.value)}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ position: { md: 'sticky' }, top: 96 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h5">Resumen del pedido</Typography>

                    {items.map((item) => (
                      <Stack
                        key={item.id}
                        direction="row"
                        spacing={1.5}
                        sx={{ justifyContent: 'space-between' }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {item.nombre_producto}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.cantidad} x {formatCurrency(item.precio_unitario)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={800}>
                          {formatCurrency(item.total_linea)}
                        </Typography>
                      </Stack>
                    ))}

                    <Divider />

                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography>Total</Typography>
                      <Typography variant="h6" color="secondary.main">
                        {formatCurrency(cart.total)}
                      </Typography>
                    </Stack>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={!items.length || creating}
                    >
                      {creating ? 'Creando pedido...' : 'Confirmar pedido'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Container>
  );
};
