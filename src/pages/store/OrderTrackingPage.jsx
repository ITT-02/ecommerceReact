// Detalle, pago y seguimiento de un pedido del cliente.
// Oculta datos de pago cuando el pedido está cancelado, vencido o en reembolso.

import { startTransition, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { TrackingCard } from '../../components/orders/TrackingCard';
import {
  useActiveStorePaymentMethods,
  useMyOrderDetail,
  useRegisterOrderPayment,
} from '../../hooks/store/useStoreOrders';
import { formatCurrency, formatDate } from '../../utils/formatters';

const paymentLabel = {
  pendiente: 'Pendiente de pago',
  validando: 'Pago en revisión',
  pagado: 'Pagado',
  rechazado: 'Pago rechazado',
  cancelado: 'Pago cancelado',
  vencido: 'Pago vencido',
  reembolso_pendiente: 'Reembolso pendiente',
  reembolsado: 'Reembolsado',
};

const orderLabel = {
  pendiente_pago: 'Pendiente de pago',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo_para_envio: 'Listo para envío',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const getPaymentColor = (status) => {
  if (status === 'pagado') return 'success';
  if (status === 'validando') return 'info';
  if (status === 'rechazado' || status === 'vencido') return 'error';
  if (status === 'reembolso_pendiente') return 'warning';
  if (status === 'reembolsado') return 'info';
  return 'warning';
};

const getFileName = (file) => file?.name || '';

const isPaymentBlockedByState = (order) => {
  if (!order) return true;

  return (
    order.estado_pedido === 'cancelado' ||
    ['cancelado', 'vencido', 'pagado', 'validando', 'reembolso_pendiente', 'reembolsado'].includes(
      order.estado_pago
    )
  );
};

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const { order, loading, error, refetch } = useMyOrderDetail(id);
  const { methods, loading: loadingMethods, error: methodsError } = useActiveStorePaymentMethods();
  const { registerPayment, registering, error: registerError } = useRegisterOrderPayment(id);

  const [metodoPago, setMetodoPago] = useState('');
  const [referenciaTransaccion, setReferenciaTransaccion] = useState('');
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const selectedMethod = useMemo(
    () => methods.find((method) => method.nombre === metodoPago) || null,
    [methods, metodoPago]
  );

  const latestPayment = order?.pago_actual || null;
  const requiresProof = selectedMethod?.tipo !== 'contra_entrega';

  const canRegisterPayment = Boolean(order?.puede_registrar_pago) && !isPaymentBlockedByState(order);

  useEffect(() => {
    if (!order || !methods.length || metodoPago || !canRegisterPayment) return;

    const fromOrder = methods.find((method) => method.nombre === order.metodo_pago);
    startTransition(() => setMetodoPago((fromOrder || methods[0]).nombre));
  }, [methods, metodoPago, order, canRegisterPayment]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setComprobanteFile(file);
    event.target.value = '';
  };

  const handleSubmitPayment = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setFormError('');

    if (!canRegisterPayment) {
      setFormError(order?.motivo_bloqueo_pago || 'Este pedido no admite registro de pago.');
      return;
    }

    if (requiresProof && !comprobanteFile) {
      setFormError('Debes adjuntar el comprobante de pago.');
      return;
    }

    await registerPayment({
      pedidoId: id,
      metodoPago,
      monto: order.total,
      comprobanteFile,
      referenciaTransaccion,
    });

    setReferenciaTransaccion('');
    setComprobanteFile(null);
    setSuccessMessage('Comprobante enviado correctamente. Tu pago está en revisión.');
    await refetch();
  };

  if (loading || loadingMethods) return <LoadingScreen message="Cargando pedido..." />;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <ErrorMessage message={error || methodsError || registerError || formError} />
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        {order && (
          <>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="overline" color="primary.main">
                      Seguimiento
                    </Typography>
                    <Typography variant="h2">{order.numero_pedido}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Creado el {formatDate(order.created_at)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    <Chip
                      label={`Pedido: ${orderLabel[order.estado_pedido] || order.estado_pedido}`}
                      color={order.estado_pedido === 'cancelado' ? 'error' : 'info'}
                      variant="outlined"
                    />
                    <Chip
                      label={paymentLabel[order.estado_pago] || `Pago: ${order.estado_pago}`}
                      color={getPaymentColor(order.estado_pago)}
                      variant="outlined"
                    />
                    <Chip
                      label={`Envío: ${order.estado_envio || 'pendiente'}`}
                      color={order.estado_envio === 'entregado' ? 'success' : 'default'}
                      variant="outlined"
                    />
                    {order.requiere_abastecimiento && (
                      <Chip label="Preparación bajo pedido" color="warning" variant="outlined" />
                    )}
                  </Stack>

                  <Typography variant="h4" color="secondary.main">
                    {formatCurrency(order.total)}
                  </Typography>

                  {order.fecha_limite_pago && ['pendiente', 'rechazado'].includes(order.estado_pago) && (
                    <Alert severity="warning">
                      Puedes registrar tu comprobante hasta el {formatDate(order.fecha_limite_pago)}. Si el plazo vence, el pedido se cancela automáticamente y ya no se mostrarán datos de pago.
                    </Alert>
                  )}

                  {order.estado_pago === 'vencido' && (
                    <Alert severity="error">
                      El plazo de pago venció. Este pedido fue cancelado y ya no admite comprobantes.
                    </Alert>
                  )}

                  {order.estado_pedido === 'cancelado' && order.estado_pago !== 'vencido' && (
                    <Alert severity="warning">
                      Este pedido fue cancelado. Ya no se puede registrar pago.
                      {order.cancelacion_motivo ? ` Motivo: ${order.cancelacion_motivo}` : ''}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={3}>
                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h5">Pago / comprobante</Typography>

                        {order.estado_pago === 'pagado' && (
                          <Alert severity="success">
                            Tu pago fue validado correctamente. Estamos avanzando con tu pedido.
                          </Alert>
                        )}

                        {order.estado_pago === 'validando' && (
                          <Alert severity="info">
                            Tu comprobante ya fue enviado y está en revisión.
                          </Alert>
                        )}

                        {order.estado_pago === 'rechazado' && canRegisterPayment && (
                          <Alert severity="warning">
                            El comprobante fue rechazado. Puedes enviar un nuevo comprobante antes del vencimiento.
                          </Alert>
                        )}

                        {order.motivo_bloqueo_pago && !canRegisterPayment && (
                          <Alert severity="info">{order.motivo_bloqueo_pago}</Alert>
                        )}

                        {latestPayment?.url_comprobante && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              Último comprobante enviado
                            </Typography>
                            <Button
                              variant="outlined"
                              href={latestPayment.url_comprobante}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Abrir comprobante
                            </Button>
                          </Box>
                        )}

                        {canRegisterPayment && (
                          <Box component="form" onSubmit={handleSubmitPayment}>
                            <Stack spacing={2}>
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
                                    <Grid container spacing={2}>
                                      <Grid size={{ xs: 12, md: selectedMethod.imagen_url ? 8 : 12 }}>
                                        <Stack spacing={1}>
                                          <Typography fontWeight={800}>{selectedMethod.nombre}</Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            {selectedMethod.tipo} · {selectedMethod.moneda || 'PEN'}
                                          </Typography>
                                          {selectedMethod.titular && (
                                            <Typography variant="body2">
                                              <strong>Titular:</strong> {selectedMethod.titular}
                                            </Typography>
                                          )}
                                          {selectedMethod.numero_cuenta && (
                                            <Typography variant="body2">
                                              <strong>Cuenta:</strong> {selectedMethod.numero_cuenta}
                                            </Typography>
                                          )}
                                          {selectedMethod.telefono && (
                                            <Typography variant="body2">
                                              <strong>Teléfono:</strong> {selectedMethod.telefono}
                                            </Typography>
                                          )}
                                          {selectedMethod.instrucciones && (
                                            <Typography variant="body2" color="text.secondary">
                                              {selectedMethod.instrucciones}
                                            </Typography>
                                          )}
                                        </Stack>
                                      </Grid>

                                      {selectedMethod.imagen_url && (
                                        <Grid size={{ xs: 12, md: 4 }}>
                                          <Box
                                            component="img"
                                            src={selectedMethod.imagen_url}
                                            alt={selectedMethod.nombre}
                                            sx={{
                                              width: '100%',
                                              maxHeight: 180,
                                              objectFit: 'contain',
                                              borderRadius: 2,
                                              border: '1px solid',
                                              borderColor: 'divider',
                                              bgcolor: 'background.paper',
                                            }}
                                          />
                                        </Grid>
                                      )}
                                    </Grid>
                                  </CardContent>
                                </Card>
                              )}

                              <TextField
                                label="Número de operación / referencia"
                                value={referenciaTransaccion}
                                onChange={(event) => setReferenciaTransaccion(event.target.value)}
                                helperText="Ingresa la referencia del pago."
                              />

                              <Stack spacing={1}>
                                <Button component="label" variant="outlined">
                                  Seleccionar comprobante
                                  <input hidden type="file" accept="image/*,.pdf" onChange={handleFileChange} />
                                </Button>
                                <Typography variant="caption" color="text.secondary">
                                  {getFileName(comprobanteFile) ||
                                    (requiresProof
                                      ? 'Adjunta imagen o PDF del comprobante.'
                                      : 'Este método no requiere comprobante obligatorio.')}
                                </Typography>
                              </Stack>

                              {registering && <LinearProgress />}

                              <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={registering || !metodoPago || (requiresProof && !comprobanteFile)}
                              >
                                {registering ? 'Enviando comprobante...' : 'Enviar comprobante'}
                              </Button>
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent>
                      <Stack spacing={2}>
                        <Typography variant="h5">Productos</Typography>

                        {(order.items || []).map((item) => (
                          <Box key={item.id}>
                            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
                              <Box>
                                <Typography fontWeight={800}>{item.nombre_producto}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {item.nombre_variante || item.codigoproducto}
                                </Typography>
                                {item.requiere_abastecimiento && (
                                  <Typography variant="caption" color="warning.main">
                                    Preparación bajo pedido
                                  </Typography>
                                )}
                                {Array.isArray(item.personalizaciones) && item.personalizaciones.length > 0 && (
                                  <Alert severity="warning" sx={{ mt: 1, py: 0.5 }}>
                                    <Typography variant="caption" fontWeight={900}>Personalización solicitada</Typography>
                                    {item.personalizaciones.map((custom) => (
                                      <Typography key={custom.id || custom.opcion_codigo} variant="caption" sx={{ display: 'block', wordBreak: 'break-word' }}>
                                        {custom.opcion_nombre || custom.opcion_codigo}: {custom.valor_texto || custom.observacion || 'Archivo adjunto'}
                                        {custom.archivo_url && (
                                          <> · <Link href={custom.archivo_url} target="_blank" rel="noreferrer">Ver archivo</Link></>
                                        )}
                                      </Typography>
                                    ))}
                                  </Alert>
                                )}
                              </Box>

                              <Typography fontWeight={800}>
                                {item.cantidad} x {formatCurrency(item.precio_unitario)}
                              </Typography>
                            </Stack>
                            <Divider sx={{ my: 1.5 }} />
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={3}>
                  <TrackingCard order={order} title="Seguimiento del envío" />
                </Stack>
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </Container>
  );
};