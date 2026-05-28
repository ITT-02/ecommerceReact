// Tarjeta de seguimiento para cotizaciones.

import {
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';

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

const paymentStatusLabel = {
  pendiente: 'pendiente',
  validando: 'en revisión',
  pagado: 'confirmado',
  rechazado: 'rechazado',
  vencido: 'vencido',
  reembolsado: 'reembolsado',
};

const getQuoteStatusMessage = (quote = {}) => {
  if (quote.estado === 'convertida') {
    if (quote.estado_pago && quote.estado_pago !== 'pagado') {
      return `La cotización generó el pedido ${quote.numero_pedido || ''}. Pago ${paymentStatusLabel[quote.estado_pago] || quote.estado_pago}.`;
    }

    return 'La cotización fue aceptada y generó un pedido.';
  }

  if (quote.estado === 'respondida') {
    return 'La cotización ya fue respondida. Revísala antes de la fecha de vencimiento.';
  }

  if (quote.estado === 'vencida') return 'La cotización venció sin generar pedido.';
  if (quote.estado === 'cancelada') return 'La cotización fue cancelada.';
  if (quote.estado === 'rechazada') return 'La cotización fue rechazada.';
  if (quote.estado === 'en_revision') return 'Estamos revisando precio, stock y condiciones.';

  return 'La solicitud fue registrada y está pendiente de revisión.';
};

export const QuoteLifecycleCard = ({ quote }) => {
  const history = quote?.historial_estados || [];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1, alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={900} sx={{ mr: 'auto' }}>
              Seguimiento de cotización
            </Typography>
            <Chip
              label={quoteStatusLabel[quote?.estado] || quote?.estado || 'Sin estado'}
              color={quoteStatusColor[quote?.estado] || 'default'}
              variant="outlined"
            />
          </Stack>

          <Alert severity={quote?.estado === 'respondida' ? 'success' : quote?.estado === 'convertida' ? 'info' : 'warning'}>
            {getQuoteStatusMessage(quote)}
          </Alert>

          <Stack spacing={1}>
            {quote?.solicitada_at && (
              <Typography variant="body2" color="text.secondary">
                Solicitada: {new Date(quote.solicitada_at).toLocaleString()}
              </Typography>
            )}
            {quote?.respondida_at && (
              <Typography variant="body2" color="text.secondary">
                Respondida: {new Date(quote.respondida_at).toLocaleString()}
              </Typography>
            )}
            {quote?.vence_at && (
              <Typography variant="body2" color="text.secondary">
                Vence: {new Date(quote.vence_at).toLocaleString()}
              </Typography>
            )}
            {quote?.pedido_id && (
              <Typography variant="body2" color="text.secondary">
                Pedido generado: {quote.numero_pedido || quote.pedido_id}
              </Typography>
            )}
          </Stack>

          {history.length > 0 && (
            <>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2" fontWeight={900}>
                  Historial
                </Typography>
                {history.slice(0, 6).map((item) => (
                  <Stack key={item.id || `${item.estado_nuevo}-${item.created_at}`} spacing={0.25}>
                    <Typography variant="body2" fontWeight={800}>
                      {quoteStatusLabel[item.estado_nuevo] || item.estado_nuevo}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
                      {item.comentario ? ` · ${item.comentario}` : ''}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
