// Mis pedidos del cliente.
// Muestra estado de pedido, pago y seguimiento, con acceso para registrar pago.

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useMyOrders } from '../../hooks/store/useStoreOrders';
import { formatCurrency, formatDate } from '../../utils/formatters';

const getPaymentChipColor = (status) => {
  if (status === 'pagado') return 'success';
  if (status === 'validando') return 'info';
  if (status === 'rechazado') return 'error';
  return 'warning';
};

const getShippingLabel = (status) => {
  const labels = {
    pendiente: 'Pendiente',
    preparando: 'Preparando',
    entregado_repartidora: 'Entregado a repartidora',
    en_transito: 'En tránsito',
    en_destino: 'En destino',
    entregado: 'Entregado',
    incidencia: 'Incidencia',
  };

  return labels[status] || status || 'Pendiente';
};

export const MyOrdersPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [estadoPedido, setEstadoPedido] = useState('');
  const [estadoPago, setEstadoPago] = useState('');
  const [estadoEnvio, setEstadoEnvio] = useState('');

  const { orders, pagination, loading, error } = useMyOrders({
    pageNumber,
    pageSize: 8,
    estadoPedido: estadoPedido || null,
    estadoPago: estadoPago || null,
    estadoEnvio: estadoEnvio || null,
  });

  if (loading) return <LoadingScreen message="Cargando pedidos..." />;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main">
            Cuenta
          </Typography>
          <Typography variant="h2">Mis pedidos</Typography>
        </Box>

        <ErrorMessage message={error} />

        <Card>
          <CardContent>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Estado pedido"
                  value={estadoPedido}
                  onChange={(event) => {
                    setEstadoPedido(event.target.value);
                    setPageNumber(1);
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="confirmado">Confirmado</MenuItem>
                  <MenuItem value="preparando">Preparando</MenuItem>
                  <MenuItem value="enviado">Enviado</MenuItem>
                  <MenuItem value="entregado">Entregado</MenuItem>
                  <MenuItem value="cancelado">Cancelado</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Estado pago"
                  value={estadoPago}
                  onChange={(event) => {
                    setEstadoPago(event.target.value);
                    setPageNumber(1);
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="validando">Validando</MenuItem>
                  <MenuItem value="pagado">Pagado</MenuItem>
                  <MenuItem value="rechazado">Rechazado</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Estado envío"
                  value={estadoEnvio}
                  onChange={(event) => {
                    setEstadoEnvio(event.target.value);
                    setPageNumber(1);
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="preparando">Preparando</MenuItem>
                  <MenuItem value="entregado_repartidora">Entregado a repartidora</MenuItem>
                  <MenuItem value="en_transito">En tránsito</MenuItem>
                  <MenuItem value="en_destino">En destino</MenuItem>
                  <MenuItem value="entregado">Entregado</MenuItem>
                  <MenuItem value="incidencia">Incidencia</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {!orders.length ? (
          <EmptyState
            title="Sin pedidos"
            description="Todavía no tienes compras registradas."
            actionLabel="Ver catálogo"
            actionTo="/catalogo"
          />
        ) : (
          <Grid container spacing={2}>
            {orders.map((order) => {
              const canPay = ['pendiente', 'rechazado'].includes(order.estado_pago);

              return (
                <Grid key={order.id} size={{ xs: 12, md: 6 }}>
                  <Card>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack
                          direction="row"
                          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                        >
                          <Box>
                            <Typography variant="h6">{order.numero_pedido}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(order.created_at)} · {order.total_items} item(s)
                            </Typography>
                          </Box>

                          <Typography variant="h6" color="secondary.main">
                            {formatCurrency(order.total)}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                          <Chip
                            size="small"
                            label={`Pedido: ${order.estado_pedido}`}
                            color="info"
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`Pago: ${order.estado_pago}`}
                            color={getPaymentChipColor(order.estado_pago)}
                            variant="outlined"
                          />
                          <Chip
                            size="small"
                            label={`Envío: ${getShippingLabel(order.estado_envio)}`}
                            color={order.estado_envio === 'entregado' ? 'success' : 'default'}
                            variant="outlined"
                          />
                          {order.requiere_abastecimiento && (
                            <Chip size="small" label="Bajo pedido" color="warning" variant="outlined" />
                          )}
                        </Stack>

                        {order.numero_seguimiento && (
                          <Typography variant="body2" color="text.secondary">
                            {order.empresa_envio || 'Courier'} · Guía {order.numero_seguimiento}
                          </Typography>
                        )}

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            component={RouterLink}
                            to={`/mis-pedidos/${order.id}`}
                            variant="outlined"
                            fullWidth
                          >
                            Ver detalle
                          </Button>

                          {canPay && (
                            <Button
                              component={RouterLink}
                              to={`/mis-pedidos/${order.id}`}
                              variant="contained"
                              fullWidth
                            >
                              Registrar pago
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {pagination.totalPages > 1 && (
          <Stack sx={{ alignItems: 'center' }}>
            <Pagination
              count={pagination.totalPages}
              page={pageNumber}
              onChange={(_, page) => setPageNumber(page)}
              color="primary"
            />
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
