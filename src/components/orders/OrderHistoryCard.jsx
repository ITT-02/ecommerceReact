import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_STATUS_COLOR,
  SHIPPING_STATUS_OPTIONS,
} from '../../adapters/orderAdapter';
import { formatDate } from '../../utils/formatters';

// Combina todas las opciones de estado disponibles (pedido, pago, envío)
// para poder resolver etiquetas a partir de cualquier tipo de estado.
const ALL_OPTIONS = [
  ...ORDER_STATUS_OPTIONS,
  ...PAYMENT_STATUS_OPTIONS,
  ...SHIPPING_STATUS_OPTIONS,
];

// Dado un valor de estado intenta obtener la etiqueta legible
// buscando en ALL_OPTIONS. Si no encuentra, devuelve el propio valor
// (fallback) o null si no hay valor.
const resolveLabel = (value) => {
  if (!value) return null;
  return ALL_OPTIONS.find((opt) => opt.value === value)?.label ?? value;
};

// Resuelve la clave de color a usar para un estado. Busca en los
// mapas de colores de orden, pago y envío en ese orden.
// Devuelve 'default' cuando no hay correspondencia.
const resolveColor = (value) => {
  if (!value) return 'default';
  return ORDER_STATUS_COLOR[value] || PAYMENT_STATUS_COLOR[value] || SHIPPING_STATUS_COLOR[value] || 'default';
};

// Extrae el arreglo de historial desde distintas posibles formas
// en que el backend pudo haberlo nombrado. Devuelve arreglo vacío
// si no existe ninguno.
const extractHistory = (order) =>
  order?.historial_estados ??
  order?.pedido_historial_estados ??
  order?.historial ??
  [];

export const OrderHistoryCard = ({
  order,
  historial: historialProp,
  title = 'Historial de estados',
  compact = false,
}) => {
  // El historial puede ser pasado explícitamente via prop o extraerse desde el objeto order
  const events = historialProp ?? extractHistory(order);

  // Clona y ordena los eventos por fecha descendente (más reciente primero)
  const sorted = [...events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

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
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <HistoryOutlinedIcon color="primary" />
              <Typography variant={compact ? 'subtitle1' : 'h5'} fontWeight={900}>
                {title}
              </Typography>
            </Stack>

            {sorted.length > 0 && (
              <Chip
                size="small"
                label={`${sorted.length} evento${sorted.length !== 1 ? 's' : ''}`}
                variant="outlined"
              />
            )}
          </Stack>

          {sorted.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay eventos registrados aún.
            </Typography>
          ) : (
            <Box sx={{ position: 'relative' }}>
              {/* Línea vertical que funciona como guía del timeline */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 7,
                  top: 10,
                  bottom: 10,
                  width: 2,
                  bgcolor: 'divider',
                }}
              />

              <Stack spacing={compact ? 1.5 : 2}>
                {sorted.map((event, index) => {
                  // Determina color del evento y color del punto en el timeline
                  const color = resolveColor(event.estado_nuevo);
                  const dotColor = color !== 'default' ? `${color}.main` : 'action.disabled';

                  return (
                    <Stack
                      // La key usa id si está disponible, sino combina estado+index
                      key={event.id ?? `${event.estado_nuevo}-${index}`}
                      direction="row"
                      spacing={1.5}
                      sx={{ position: 'relative' }}
                    >
                      {/* Punto que marca el evento en el timeline */}
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: dotColor,
                          border: '2px solid',
                          borderColor: 'background.paper',
                          flexShrink: 0,
                          mt: 0.5,
                          zIndex: 1,
                        }}
                      />

                      {/* Contenido del evento: etiqueta, fecha, anterior y comentario */}
                      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 0.5,
                          }}
                        >
                          {/* Etiqueta principal del nuevo estado */}
                          <Chip
                            size="small"
                            label={resolveLabel(event.estado_nuevo)}
                            color={color}
                            variant="filled"
                            sx={{ fontWeight: 700 }}
                          />
                          {/* Fecha del evento formateada */}
                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            {formatDate(event.created_at)}
                          </Typography>
                        </Stack>

                        {/* Estado anterior, si existe */}
                        {event.estado_anterior && (
                          <Typography variant="caption" color="text.secondary">
                            Anterior: {resolveLabel(event.estado_anterior)}
                          </Typography>
                        )}

                        {/* Comentario opcional del evento */}
                        {event.comentario && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: 'italic', wordBreak: 'break-word' }}
                          >
                            "{event.comentario}"
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
