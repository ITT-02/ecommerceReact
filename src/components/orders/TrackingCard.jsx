// Tarjeta reutilizable de seguimiento logístico.
// Sirve para cliente y administración sin duplicar el flujo de estados.

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import {
  SHIPPING_STATUS_COLOR,
  getShippingStatusLabel,
} from '../../adapters/orderAdapter';
import { formatDate } from '../../utils/formatters';
import { OrderProgressMini } from './OrderProgressMini';

const getOrderHistory = (order) => (
  order?.historial_estados ??
  order?.pedido_historial_estados ??
  order?.historial ??
  []
);

export const TrackingCard = ({
  order,
  title = 'Seguimiento del envío',
  compact = false,
  showExternalButton = true,
}) => {
  const status = order?.estado_envio || 'pendiente';
  const hasTrackingData = Boolean(
    order?.empresa_envio ||
    order?.numero_seguimiento ||
    order?.url_seguimiento,
  );

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        height: '100%',
        bgcolor: 'background.paper',
        borderColor: theme.palette.custom?.semantic?.border || theme.palette.divider,
      })}
    >
      <CardContent>
        <Stack spacing={compact ? 1.5 : 2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <LocalShippingOutlinedIcon color="primary" />
              <Typography variant={compact ? 'subtitle1' : 'h5'} fontWeight={900}>
                {title}
              </Typography>
            </Stack>

            <Chip
              size="small"
              label={getShippingStatusLabel(status)}
              color={SHIPPING_STATUS_COLOR[status] || 'default'}
              variant="outlined"
            />
          </Stack>

          <OrderProgressMini
            estadoEnvio={status}
            estadoPedido={order?.estado_pedido}
            historialEventos={getOrderHistory(order)}
            createdAt={order?.created_at}
            entregadoRepartidoraEn={order?.entregado_repartidora_en}
            entregadoClienteEn={order?.entregado_cliente_en}
            compact={compact}
          />

          {status === 'incidencia' && (
            <Alert severity="warning">
              El envío tiene una incidencia. Revisa el comentario del historial o comunícate con la tienda.
            </Alert>
          )}

          <Divider />

          {hasTrackingData ? (
            <Stack spacing={0.75}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Empresa transportista
                </Typography>
                <Typography variant="body2">
                  {order?.empresa_envio || 'No registrada'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  Número de seguimiento
                </Typography>
                <Typography variant="body2">
                  {order?.numero_seguimiento || 'No registrado'}
                </Typography>
              </Box>

              {order?.entregado_repartidora_en && (
                <Typography variant="caption" color="text.secondary">
                  Entregado a transportista: {formatDate(order.entregado_repartidora_en)}
                </Typography>
              )}

              {order?.entregado_cliente_en && (
                <Typography variant="caption" color="text.secondary">
                  Entregado al cliente: {formatDate(order.entregado_cliente_en)}
                </Typography>
              )}

              {order?.url_seguimiento && showExternalButton && (
                <Button
                  component={Link}
                  href={order.url_seguimiento}
                  target="_blank"
                  rel="noreferrer"
                  variant="outlined"
                  size="small"
                  sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                >
                  Abrir rastreo externo
                </Button>
              )}
            </Stack>
          ) : (
            <Alert severity="info">
              Cuando el pedido se entregue a la empresa transportista, aquí aparecerá la empresa, guía y enlace de rastreo.
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
