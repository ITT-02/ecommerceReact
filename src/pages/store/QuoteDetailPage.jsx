// Detalle de cotización del cliente.
// Muestra la solicitud enviada, respuesta de ventas y acciones para aceptar/cancelar.

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

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
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ErrorMessage } from '../../components/common/ErrorMessage';
import { QuoteLifecycleCard } from '../../components/quotes/QuoteLifecycleCard';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useMyQuoteDetail } from '../../hooks/store/useStoreQuotes';
import { formatCurrency } from '../../utils/formatters';

const quoteStatusLabel = {
  solicitada: 'Solicitada',
  en_revision: 'En revisión',
  respondida: 'Respondida',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  vencida: 'Vencida',
  convertida: 'Pedido generado',
};

const quoteStatusColor = {
  solicitada: 'info',
  en_revision: 'warning',
  respondida: 'success',
  aceptada: 'success',
  rechazada: 'error',
  cancelada: 'default',
  vencida: 'default',
  convertida: 'success',
};

const requestTypeLabel = {
  cotizacion: 'Cotización',
  personalizacion: 'Personalización',
};

const getAttributesText = (attributes = []) => {
  if (!Array.isArray(attributes) || attributes.length === 0) return 'Sin atributos registrados';

  return attributes
    .map((item) => `${item.atributo_nombre || 'Atributo'}: ${item.valor}`)
    .join(' · ');
};

const formatPersonalizationDetail = (detail = {}) => {
  if (!detail || Object.keys(detail).length === 0) return [];

  const rows = [];

  if (Array.isArray(detail.opciones) && detail.opciones.length > 0) {
    rows.push(['Solicita', detail.opciones.join(', ')]);
  }
  if (detail.descripcion) rows.push(['Descripción', detail.descripcion]);
  if (detail.medidas_especiales) rows.push(['Medidas especiales', detail.medidas_especiales]);
  if (detail.colores_solicitados) rows.push(['Colores', detail.colores_solicitados]);
  if (detail.material_solicitado) rows.push(['Material', detail.material_solicitado]);
  if (detail.acabado_solicitado) rows.push(['Acabado', detail.acabado_solicitado]);
  if (detail.precio_adicional_referencial) rows.push(['Adicional referencial', formatCurrency(detail.precio_adicional_referencial)]);
  if (detail.referencia_diseno_url) rows.push(['Referencia', 'Archivo adjunto']);
  if (Array.isArray(detail.personalizaciones)) {
    detail.personalizaciones.forEach((item) => {
      if (item.valor_texto) rows.push([item.opcion_nombre || item.opcion_codigo || 'Personalización', item.valor_texto]);
      if (item.observacion) rows.push([`${item.opcion_nombre || 'Opción'} - observación`, item.observacion]);
      if (item.archivo_url) rows.push([`${item.opcion_nombre || 'Opción'} - archivo`, 'Archivo adjunto']);
    });
  }

  return rows;
};

export const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cancelComment, setCancelComment] = useState('');
  const [notice, setNotice] = useState('');

  const {
    quote,
    loading,
    saving,
    error,
    markAsRead,
    acceptQuote,
    cancelQuote,
  } = useMyQuoteDetail(id);

  useEffect(() => {
    if (quote?.tiene_respuesta_nueva) {
      markAsRead(quote.id);
    }
  }, [markAsRead, quote?.id, quote?.tiene_respuesta_nueva]);

  const handleAccept = async () => {
    const pedidoId = await acceptQuote({ cotizacionId: id });
    navigate(`/mis-pedidos/${pedidoId}`);
  };

  const handleCancel = async () => {
    await cancelQuote({ cotizacionId: id, comentario: cancelComment });
    setNotice('Cotización cancelada correctamente.');
  };

  if (loading) return <LoadingScreen message="Cargando cotización..." />;

  if (!quote) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <ErrorMessage message={error || 'Cotización no encontrada.'} />
        <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate('/mis-cotizaciones')}>
          Volver a mis cotizaciones
        </Button>
      </Container>
    );
  }

  const canAccept = quote.estado === 'respondida' && Number(quote.total_estimado || 0) > 0;
  const canCancel = ['solicitada', 'en_revision', 'respondida'].includes(quote.estado);
  const isConverted = quote.estado === 'convertida' && quote.pedido_id;
  const personalizationRows = formatPersonalizationDetail(quote.detalle_personalizacion);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate('/mis-cotizaciones')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver a mis cotizaciones
        </Button>

        <ErrorMessage message={error} />

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
              >
                <Box>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 1 }}>
                    <Chip
                      label={requestTypeLabel[quote.tipo_solicitud] || 'Cotización'}
                      color={quote.tipo_solicitud === 'personalizacion' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                    <Chip
                      label={quoteStatusLabel[quote.estado] || quote.estado}
                      color={quoteStatusColor[quote.estado] || 'default'}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="h3" fontWeight={900}>
                    {quote.numero_cotizacion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Solicitada: {quote.created_at ? new Date(quote.created_at).toLocaleString() : '-'}
                  </Typography>
                </Box>
              </Stack>

              {quote.vence_at && quote.estado === 'respondida' && (
                <Alert severity="warning">
                  Esta cotización vence el {new Date(quote.vence_at).toLocaleString()}.
                </Alert>
              )}

              {quote.respuesta_admin ? (
                <Alert severity="success">
                  <Typography variant="subtitle2" fontWeight={800}>
                      Respuesta de Aliqora
                  </Typography>
                  <Typography variant="body2">{quote.respuesta_admin}</Typography>
                </Alert>
              ) : (
                <Alert severity="info">
                  Esta solicitud aún no tiene respuesta. Cuando esté lista, aparecerá aquí y en Mis cotizaciones.
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        <QuoteLifecycleCard quote={quote} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={900}>
                      Lo que solicitaste
                    </Typography>

                    {quote.mensaje_cliente && (
                      <Alert severity="info">
                        <Typography variant="subtitle2" fontWeight={800}>
Mensaje enviado
                        </Typography>
                        <Typography variant="body2">{quote.mensaje_cliente}</Typography>
                      </Alert>
                    )}

                    {personalizationRows.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>
                          Detalle de personalización
                        </Typography>
                        <Stack spacing={1}>
                          {personalizationRows.map(([label, value]) => (
                            <Stack key={label} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                              <Typography variant="body2" fontWeight={800} sx={{ minWidth: 150 }}>
                                {label}:
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                                {value}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6" fontWeight={900}>
                      Productos cotizados
                    </Typography>

                    {(quote.items || []).map((item) => {
                      const itemPersonalizationRows = formatPersonalizationDetail(item.detalle_personalizacion);

                      return (
                        <Box key={item.id}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle1" fontWeight={900}>
                              {item.nombre_producto}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                              {item.nombre_variante || item.codigoproducto || 'Variante'}
                            </Typography>

                            <Typography variant="caption" color="text.secondary">
                              {getAttributesText(item.atributos_snapshot)}
                            </Typography>

                            {item.notas_cliente && (
                              <Alert severity="info">Detalle enviado: {item.notas_cliente}</Alert>
                            )}

                            {itemPersonalizationRows.length > 0 && (
                              <Stack spacing={0.5}>
                                {itemPersonalizationRows.map(([label, value]) => (
                                  <Typography key={label} variant="caption" color="text.secondary">
                                    <strong>{label}:</strong> {value}
                                  </Typography>
                                ))}
                              </Stack>
                            )}

                            <Grid container spacing={1.5}>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary">Cantidad</Typography>
                                <Typography variant="body2" fontWeight={800}>{item.cantidad}</Typography>
                              </Grid>
                              <Grid size={{ xs: 6, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary">Precio</Typography>
                                <Typography variant="body2" fontWeight={800}>
                                  {Number(item.precio_cotizado || 0) > 0
                                    ? formatCurrency(item.precio_cotizado)
                                    : 'Pendiente'}
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 3 }}>
                                <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                                <Typography variant="body2" fontWeight={800}>
                                  {Number(item.subtotal_cotizado || 0) > 0
                                    ? formatCurrency(item.subtotal_cotizado)
                                    : 'Pendiente'}
                                </Typography>
                              </Grid>
                            </Grid>

                            {item.comentario_admin && (
                              <Alert severity="success">Comentario: {item.comentario_admin}</Alert>
                            )}
                          </Stack>
                          <Divider sx={{ my: 2 }} />
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={900}>
                    Resumen
                  </Typography>

                  <Stack spacing={1}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                      <Typography variant="body2" fontWeight={800}>{formatCurrency(quote.subtotal_estimado)}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Descuento</Typography>
                      <Typography variant="body2" fontWeight={800}>{formatCurrency(quote.descuento_estimado)}</Typography>
                    </Stack>
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Envío</Typography>
                      <Typography variant="body2" fontWeight={800}>{formatCurrency(quote.costo_envio_estimado)}</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" fontWeight={900}>Total</Typography>
                      <Typography variant="subtitle1" fontWeight={900}>{formatCurrency(quote.total_estimado)}</Typography>
                    </Stack>
                  </Stack>

                  {canAccept && (
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleOutlineRoundedIcon />}
                      disabled={saving}
                      onClick={handleAccept}
                      fullWidth
                    >
                      Aceptar y generar pedido
                    </Button>
                  )}

                  {isConverted && (
                    <Button
                      variant="contained"
                      startIcon={<ShoppingBagOutlinedIcon />}
                      onClick={() => navigate(`/mis-pedidos/${quote.pedido_id}`)}
                      fullWidth
                    >
                      Ver pedido generado
                    </Button>
                  )}

                  {canCancel && !isConverted && (
                    <Stack spacing={1}>
                      <TextField
                        label="Motivo de cancelación"
                        value={cancelComment}
                        onChange={(event) => setCancelComment(event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={saving}
                        onClick={handleCancel}
                        fullWidth
                      >
                        Cancelar cotización
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};
