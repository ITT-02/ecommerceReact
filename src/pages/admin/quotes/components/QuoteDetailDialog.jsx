import {
  Alert,
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import { PersonalizationRequestSummary } from '../../../../components/quotes/PersonalizationRequestSummary';
import { QuoteLifecycleCard } from '../../../../components/quotes/QuoteLifecycleCard';
import { formatCurrency } from '../../../../utils/formatters';

const statusLabel = {
  solicitada: 'Solicitada',
  en_revision: 'En revisión',
  respondida: 'Respondida',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  vencida: 'Vencida',
  convertida: 'Pedido generado',
};

const typeLabel = {
  cotizacion: 'Cotización',
  personalizacion: 'Personalización',
};

const getAttributesText = (attributes = []) => {
  if (!Array.isArray(attributes) || attributes.length === 0) return 'Sin atributos';

  return attributes
    .map((item) => `${item.atributo_nombre || 'Atributo'}: ${item.valor}`)
    .join(' · ');
};

const getOrderMessage = (quote = {}) => {
  if (!quote.pedido_id) return null;

  const paymentText = quote.estado_pago || 'pendiente';
  const orderText = quote.estado_pedido || 'pendiente';

  if (quote.estado_pago === 'pagado') {
    return `La cotización generó el pedido ${quote.numero_pedido || quote.pedido_id}. El pago está confirmado y el pedido está ${orderText}.`;
  }

  if (quote.estado_pago === 'rechazado') {
    return `La cotización generó el pedido ${quote.numero_pedido || quote.pedido_id}, pero el pago fue rechazado.`;
  }

  if (quote.estado_pago === 'vencido') {
    return `La cotización generó el pedido ${quote.numero_pedido || quote.pedido_id}, pero el pago venció.`;
  }

  return `La cotización generó el pedido ${quote.numero_pedido || quote.pedido_id}. Estado del pedido: ${orderText}. Pago: ${paymentText}.`;
};

export const QuoteDetailDialog = ({ open, quote, onClose }) => {
  if (!quote) return null;

  const orderMessage = getOrderMessage(quote);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Detalle de cotización</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <QuoteLifecycleCard quote={quote} />

          <Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, mb: 1 }}>
              <Chip label={quote.numero_cotizacion} variant="outlined" />
              <Chip label={statusLabel[quote.estado] || quote.estado} color="primary" variant="outlined" />
              <Chip
                label={typeLabel[quote.tipo_solicitud] || 'Cotización'}
                color={quote.tipo_solicitud === 'personalizacion' ? 'secondary' : 'default'}
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Cliente: {quote.nombre_cliente || '-'} · {quote.telefono_cliente || '-'} · {quote.correo_cliente || '-'}
            </Typography>
            {quote.canal_venta === 'manual' && (
              <Typography variant="body2" color="text.secondary">
                Origen: venta manual · Canal: {quote.canal_atencion || 'manual'}
              </Typography>
            )}
          </Box>

          {quote.canal_venta === 'manual' && (
            <Alert severity="info">
              <Typography variant="subtitle2" fontWeight={900}>Cotización asistida por vendedor</Typography>
              <Typography variant="body2">
                La respuesta se gestiona desde el panel administrativo y el vendedor comunica el avance al cliente.
              </Typography>
            </Alert>
          )}

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">Subtotal</Typography>
              <Typography fontWeight={800}>{formatCurrency(quote.subtotal_estimado)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">Descuento</Typography>
              <Typography fontWeight={800}>{formatCurrency(quote.descuento_estimado)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">Envío</Typography>
              <Typography fontWeight={800}>{formatCurrency(quote.costo_envio_estimado)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">Total</Typography>
              <Typography fontWeight={900}>{formatCurrency(quote.total_estimado)}</Typography>
            </Grid>
          </Grid>

          {orderMessage && (
            <Alert severity={quote.estado_pago === 'pagado' ? 'success' : 'warning'}>
              <Typography variant="subtitle2" fontWeight={900}>
                Seguimiento del pedido generado
              </Typography>
              <Typography variant="body2">{orderMessage}</Typography>
            </Alert>
          )}

          {!quote.pedido_id && ['respondida', 'vencida', 'cancelada', 'rechazada'].includes(quote.estado) && (
            <Alert severity="info">
              Esta cotización todavía no generó pedido.
            </Alert>
          )}

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={900}>Lo que solicitó el cliente</Typography>

            {quote.mensaje_cliente ? (
              <Alert severity="info">
                <Typography variant="subtitle2" fontWeight={800}>Mensaje del cliente</Typography>
                <Typography variant="body2">{quote.mensaje_cliente}</Typography>
              </Alert>
            ) : (
              <Typography variant="body2" color="text.secondary">Sin mensaje general.</Typography>
            )}

            {quote.requiere_personalizacion && (
              <PersonalizationRequestSummary
                title="Resumen general de personalización"
                detail={quote.detalle_personalizacion || {}}
              />
            )}
          </Stack>

          <Divider />

          <Stack spacing={1.5}>
            <Typography variant="h6" fontWeight={900}>Items</Typography>

            {(quote.items || []).map((item) => {
              const hasPersonalization =
                item.detalle_personalizacion?.modo === 'personalizado' ||
                (item.personalizaciones || []).length > 0;

              return (
                <Box
                  key={item.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant="subtitle1" fontWeight={900}>{item.nombre_producto}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.nombre_variante || item.codigoproducto || 'Variante'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getAttributesText(item.atributos_snapshot)}
                    </Typography>

                    {item.notas_cliente && <Alert severity="info">Detalle del producto: {item.notas_cliente}</Alert>}

                    {hasPersonalization ? (
                      <PersonalizationRequestSummary
                        title="Personalización para cotizar / producir"
                        detail={item.detalle_personalizacion || {}}
                        personalizations={item.personalizaciones || []}
                        compact
                      />
                    ) : (
                      <Alert severity="success">Producto estándar, sin personalización.</Alert>
                    )}

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Cantidad</Typography>
                        <Typography fontWeight={800}>{item.cantidad}</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Precio cotizado</Typography>
                        <Typography fontWeight={800}>
                          {Number(item.precio_cotizado || 0) > 0 ? formatCurrency(item.precio_cotizado) : 'Pendiente'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Subtotal</Typography>
                        <Typography fontWeight={800}>
                          {Number(item.subtotal_cotizado || 0) > 0 ? formatCurrency(item.subtotal_cotizado) : 'Pendiente'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary">Referencia</Typography>
                        <Typography fontWeight={800}>
                          {Number(item.precio_referencial || 0) > 0 ? formatCurrency(item.precio_referencial) : '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
