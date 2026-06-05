import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { alpha } from '@mui/material/styles';

import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_STATUS_COLOR,
  SHIPPING_STATUS_OPTIONS,
} from '../../../../adapters/orderAdapter';

import { formatDate } from '../../../../utils/formatters';

const ALL_OPTIONS = [
  ...ORDER_STATUS_OPTIONS,
  ...PAYMENT_STATUS_OPTIONS,
  ...SHIPPING_STATUS_OPTIONS,
];

const resolveLabel = (value) => {
  if (!value) return null;

  return ALL_OPTIONS.find((option) => option.value === value)?.label ?? value;
};

const resolveColor = (value) => {
  if (!value) return 'default';

  return (
    ORDER_STATUS_COLOR[value] ||
    PAYMENT_STATUS_COLOR[value] ||
    SHIPPING_STATUS_COLOR[value] ||
    'default'
  );
};

const extractHistory = (order) => {
  return (
    order?.historial_estados ??
    order?.pedido_historial_estados ??
    order?.historial ??
    []
  );
};

const getPaletteColor = (theme, color) => {
  if (color === 'success') return theme.palette.success.main;
  if (color === 'warning') return theme.palette.warning.main;
  if (color === 'error') return theme.palette.error.main;
  if (color === 'info') return theme.palette.info.main;
  if (color === 'secondary') return theme.palette.secondary.main;
  if (color === 'primary') return theme.palette.primary.main;

  return theme.palette.text.secondary;
};

export const OrderInternalHistory = ({
  order,
  historial: historialProp,
  title = 'Historial interno del pedido',
  description = 'Registro administrativo de cambios de estado, comentarios y trazabilidad del pedido.',
  compact = false,
}) => {
  const events = historialProp ?? extractHistory(order);

  const sorted = [...events].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <Card
      variant="outlined"
      sx={(theme) => {
        const s = theme.palette.custom.semantic;

        return {
          height: '100%',
          bgcolor: theme.palette.background.paper,
          borderColor: s.border,
          borderRadius: theme.palette.custom.radius.xs,
          backgroundImage: 'none',
          boxShadow: 'none',
        };
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, md: compact ? 2 : 2.5 },
          '&:last-child': {
            pb: { xs: 2, md: compact ? 2 : 2.5 },
          },
        }}
      >
        <Stack spacing={compact ? 1.5 : 2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Box
                sx={(theme) => ({
                  width: 34,
                  height: 34,
                  borderRadius: theme.palette.custom.radius.xs,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  display: 'grid',
                  placeItems: 'center',
                })}
              >
                <HistoryOutlinedIcon fontSize="small" />
              </Box>

              <Box>
                <Typography variant={compact ? 'subtitle1' : 'h5'} sx={{ fontWeight: 900 }}>
                  {title}
                </Typography>

                {!compact && (
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                )}
              </Box>
            </Stack>

            <Chip
              size="small"
              label={`${sorted.length} evento${sorted.length !== 1 ? 's' : ''}`}
              variant="outlined"
            />
          </Stack>

          {sorted.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay eventos registrados aún.
            </Typography>
          ) : (
            <Box sx={{ position: 'relative' }}>
              <Box
                sx={(theme) => ({
                  position: 'absolute',
                  left: 7,
                  top: 10,
                  bottom: 10,
                  width: 2,
                  bgcolor: theme.palette.divider,
                })}
              />

              <Stack spacing={compact ? 1.5 : 2}>
                {sorted.map((event, index) => {
                  const color = resolveColor(event.estado_nuevo);
                  const label = resolveLabel(event.estado_nuevo);
                  const previousLabel = resolveLabel(event.estado_anterior);

                  return (
                    <Stack
                      key={event.id ?? `${event.estado_nuevo}-${event.created_at}-${index}`}
                      direction="row"
                      spacing={1.5}
                      sx={{ position: 'relative' }}
                    >
                      <Box
                        sx={(theme) => {
                          const main = getPaletteColor(theme, color);

                          return {
                            width: 16,
                            height: 16,
                            borderRadius: theme.palette.custom.radius.xs,
                            bgcolor: main,
                            border: `2px solid ${theme.palette.background.paper}`,
                            flexShrink: 0,
                            mt: 0.5,
                            zIndex: 1,
                          };
                        }}
                      />

                      <Box
                        sx={(theme) => {
                          const main = getPaletteColor(theme, color);

                          return {
                            flex: 1,
                            minWidth: 0,
                            borderRadius: theme.palette.custom.radius.xs,
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: alpha(main, 0.035),
                            px: 1.5,
                            py: 1.25,
                          };
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          sx={{
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: 0.5,
                          }}
                        >
                          <Chip
                            size="small"
                            label={label}
                            variant="outlined"
                            sx={(theme) => {
                              const main = getPaletteColor(theme, color);

                              return {
                                bgcolor: alpha(main, 0.08),
                                color: main,
                                borderColor: alpha(main, 0.28),
                                fontWeight: 800,
                              };
                            }}
                          />

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {formatDate(event.created_at)}
                          </Typography>
                        </Stack>

                        {event.estado_anterior && previousLabel && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.75 }}
                          >
                            Anterior: {previousLabel}
                          </Typography>
                        )}

                        {event.comentario && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.75,
                              fontStyle: 'italic',
                              wordBreak: 'break-word',
                            }}
                          >
                            “{event.comentario}”
                          </Typography>
                        )}

                        {event.usuario_nombre && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.75 }}
                          >
                            Registrado por: {event.usuario_nombre}
                          </Typography>
                        )}
                      </Box>
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