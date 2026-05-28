// Progreso visual reutilizable para el seguimiento de pedidos.
// Centraliza el flujo logístico para cliente y administración.

import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Divider,
  Popover,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeliveryDiningRoundedIcon from '@mui/icons-material/DeliveryDiningRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';

/**
 * Pasos oficiales del flujo visible para el cliente.
 * Las claves están alineadas con estado_envio de pedidos:
 * pendiente, preparando, entregado_repartidora, en_transito, en_destino, entregado.
 */
const PROGRESS_STEPS = [
  {
    key: 'pendiente',
    label: 'Pedido creado',
    Icon: ShoppingBagRoundedIcon,
    aliases: ['pedido_creado', 'pendiente_pago', 'confirmado'],
  },
  {
    key: 'preparando',
    label: 'En preparación',
    Icon: BuildCircleRoundedIcon,
    aliases: ['en_preparacion', 'listo_para_envio'],
  },
  {
    key: 'entregado_repartidora',
    label: 'Con transportista',
    Icon: DeliveryDiningRoundedIcon,
    aliases: ['entregado_transportista', 'con_repartidora', 'con_transportista'],
  },
  {
    key: 'en_transito',
    label: 'En tránsito',
    Icon: LocalShippingRoundedIcon,
    aliases: ['enviado'],
  },
  {
    key: 'en_destino',
    label: 'En destino',
    Icon: LocationOnRoundedIcon,
    aliases: ['cerca_destino', 'cerca_entrega'],
  },
  {
    key: 'entregado',
    label: 'Entregado',
    Icon: CheckCircleRoundedIcon,
    aliases: ['entregado_cliente'],
  },
];

const PULSE_KEYFRAMES = {
  '@keyframes orderStepPulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.12)' },
  },
};

const findStepByValue = (value) => {
  if (!value) return null;
  const normalized = String(value).trim();

  return PROGRESS_STEPS.find(
    (step) => step.key === normalized || step.aliases.includes(normalized),
  ) ?? null;
};

const getStepIndex = (value) => {
  const step = findStepByValue(value);
  if (!step) return -1;
  return PROGRESS_STEPS.findIndex((item) => item.key === step.key);
};

/**
 * Cuando estado_envio aún está pendiente, usamos estado_pedido para mostrar
 * un avance coherente en la preparación antes de entregar a transportista.
 */
const resolveActiveStepKey = ({ estadoEnvio, estadoPedido, eventMap }) => {
  if (estadoEnvio === 'incidencia') {
    const lastEventIndex = PROGRESS_STEPS.reduce((maxIndex, step, index) => {
      if (eventMap[step.key]) return Math.max(maxIndex, index);
      return maxIndex;
    }, -1);

    return PROGRESS_STEPS[Math.max(lastEventIndex, 0)]?.key ?? 'pendiente';
  }

  const envioStep = findStepByValue(estadoEnvio);
  if (envioStep && envioStep.key !== 'pendiente') return envioStep.key;

  const pedidoStep = findStepByValue(estadoPedido);
  if (pedidoStep) return pedidoStep.key;

  return envioStep?.key ?? 'pendiente';
};

const getEventDate = (event) => (
  event?.fecha_hora ??
  event?.created_at ??
  event?.updated_at ??
  event?.fecha ??
  event?.fecha_registro ??
  null
);

const getEventMessage = (event) => (
  event?.mensaje ??
  event?.comentario ??
  event?.descripcion ??
  event?.detalle ??
  ''
);

const normalizeHistoryEvent = (event) => {
  const rawStatus = (
    event?.estado ??
    event?.estado_envio ??
    event?.estado_nuevo ??
    event?.estadoNuevo ??
    event?.key ??
    ''
  );

  const step = findStepByValue(rawStatus);
  if (!step) return null;

  return {
    id: event?.id ?? `${step.key}-${getEventDate(event) ?? Math.random()}`,
    estado: step.key,
    fecha_hora: getEventDate(event),
    mensaje: getEventMessage(event),
    raw: event,
  };
};

const formatFechaHora = (isoString) => {
  if (!isoString) return { fecha: '—', hora: '—' };
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) return { fecha: '—', hora: '—' };

  return {
    fecha: date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    hora: date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

const buildSyntheticEvents = ({ createdAt, entregadoRepartidoraEn, entregadoClienteEn }) => ([
  createdAt && {
    id: 'synthetic-pendiente',
    estado: 'pendiente',
    fecha_hora: createdAt,
    mensaje: 'Pedido registrado correctamente.',
  },
  entregadoRepartidoraEn && {
    id: 'synthetic-entregado-repartidora',
    estado: 'entregado_repartidora',
    fecha_hora: entregadoRepartidoraEn,
    mensaje: 'El paquete fue entregado a la empresa transportista.',
  },
  entregadoClienteEn && {
    id: 'synthetic-entregado-cliente',
    estado: 'entregado',
    fecha_hora: entregadoClienteEn,
    mensaje: 'El paquete fue marcado como entregado al cliente.',
  },
].filter(Boolean));

const buildEventMap = ({ historialEventos, createdAt, entregadoRepartidoraEn, entregadoClienteEn }) => {
  const normalizedEvents = [
    ...buildSyntheticEvents({ createdAt, entregadoRepartidoraEn, entregadoClienteEn }),
    ...(historialEventos || []).map(normalizeHistoryEvent).filter(Boolean),
  ].sort((a, b) => {
    const dateA = new Date(a.fecha_hora || 0).getTime();
    const dateB = new Date(b.fecha_hora || 0).getTime();
    return dateA - dateB;
  });

  return normalizedEvents.reduce((map, event) => {
    map[event.estado] = event;
    return map;
  }, {});
};

const getStepTone = ({ theme, status, isIncident }) => {
  const semantic = theme.palette.custom?.semantic;
  const entityTone = semantic?.entityTone || {};

  if (isIncident && status === 'active') {
    return {
      icon: theme.palette.error.main,
      bg: entityTone.danger?.bg || alpha(theme.palette.error.main, 0.12),
      border: entityTone.danger?.border || alpha(theme.palette.error.main, 0.24),
      text: theme.palette.error.main,
      line: theme.palette.error.main,
      glow: theme.palette.custom?.shadows?.goldGlow,
    };
  }

  if (status === 'done') {
    return {
      icon: theme.palette.success.main,
      bg: entityTone.success?.bg || alpha(theme.palette.success.main, 0.12),
      border: entityTone.success?.border || alpha(theme.palette.success.main, 0.24),
      text: theme.palette.text.primary,
      line: theme.palette.success.main,
      glow: theme.palette.custom?.shadows?.emeraldGlow,
    };
  }

  if (status === 'active') {
    return {
      icon: theme.palette.primary.main,
      bg: semantic?.primarySoft || alpha(theme.palette.primary.main, 0.14),
      border: theme.palette.primary.main,
      text: theme.palette.text.primary,
      line: theme.palette.primary.main,
      glow: theme.palette.custom?.shadows?.goldGlow,
    };
  }

  return {
    icon: theme.palette.text.disabled,
    bg: alpha(theme.palette.text.primary, 0.045),
    border: theme.palette.divider,
    text: theme.palette.text.disabled,
    line: theme.palette.divider,
    glow: 'none',
  };
};

function StepNode({ paso, status, evento, isLast, onClick, compact, isIncident }) {
  const { Icon } = paso;
  const isActive = status === 'active';
  const hasEvento = Boolean(evento);

  const handleClick = useCallback(
    (event) => {
      if (!hasEvento) return;
      onClick(event, { paso, evento });
    },
    [hasEvento, onClick, paso, evento],
  );

  const circleSize = compact ? 34 : 40;
  const iconSize = compact ? 17 : 19;

  const circle = (
    <Box
      component="button"
      type="button"
      onClick={handleClick}
      aria-label={`${paso.label}${hasEvento ? ' — ver detalle' : ' — sin información aún'}`}
      sx={{
        all: 'unset',
        cursor: hasEvento ? 'pointer' : 'default',
        display: 'flex',
        borderRadius: '50%',
        '&:focus-visible .order-progress-circle': {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 3,
        },
      }}
    >
      <Box
        className="order-progress-circle"
        sx={(theme) => {
          const tone = getStepTone({ theme, status, isIncident });
          const motion = theme.palette.custom?.motion;

          return {
            width: circleSize,
            height: circleSize,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: tone.icon,
            bgcolor: tone.bg,
            border: '2px solid',
            borderColor: tone.border,
            boxShadow: isActive ? tone.glow : 'none',
            transition: `background-color ${motion?.durationSlow || '320ms'} ${motion?.easeOut || 'ease'}, border-color ${motion?.durationSlow || '320ms'} ${motion?.easeOut || 'ease'}, box-shadow ${motion?.durationBase || '200ms'} ${motion?.easeOut || 'ease'}, transform ${motion?.durationBase || '200ms'} ${motion?.easeOut || 'ease'}`,
            ...(isActive && {
              ...PULSE_KEYFRAMES,
              animation: 'orderStepPulse 1.45s ease-in-out infinite',
            }),
            ...(hasEvento && {
              '&:hover': {
                animation: 'none',
                transform: 'scale(1.08)',
              },
            }),
          };
        }}
      >
        {status === 'pending' ? (
          <RadioButtonUncheckedRoundedIcon sx={{ fontSize: iconSize }} />
        ) : (
          <Icon sx={{ fontSize: iconSize }} />
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        mb: isLast ? 0 : compact ? 0.25 : 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mr: compact ? 1.25 : 1.75,
        }}
      >
        {hasEvento ? circle : (
          <Tooltip title="Sin información aún" placement="right" arrow>
            <span>{circle}</span>
          </Tooltip>
        )}

        {!isLast && (
          <Box
            sx={(theme) => ({
              width: 2,
              flexGrow: 1,
              minHeight: compact ? 22 : 30,
              bgcolor: theme.palette.divider,
              borderRadius: theme.palette.custom?.radius?.pill || 999,
              overflow: 'hidden',
              my: 0.5,
            })}
          >
            <Box
              sx={(theme) => {
                const tone = getStepTone({ theme, status, isIncident });

                return {
                  width: '100%',
                  bgcolor: tone.line,
                  height: status === 'done' ? '100%' : '0%',
                  transition: `height ${theme.palette.custom?.motion?.durationSlow || '320ms'} ${theme.palette.custom?.motion?.easeOut || 'ease'}`,
                };
              }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ pt: compact ? 0.45 : 0.65, pb: isLast ? 0 : compact ? 1.5 : 2.25, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={(theme) => {
            const tone = getStepTone({ theme, status, isIncident });

            return {
              color: tone.text,
              fontWeight: isActive ? 900 : status === 'done' ? 800 : 600,
              lineHeight: 1.3,
              transition: `color ${theme.palette.custom?.motion?.durationBase || '200ms'} ${theme.palette.custom?.motion?.easeOut || 'ease'}`,
            };
          }}
        >
          {paso.label}
        </Typography>

        {evento?.mensaje && !compact && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mt: 0.25,
              lineHeight: 1.4,
            }}
          >
            {evento.mensaje}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function EventoPopover({ anchor, data, onClose }) {
  const open = Boolean(anchor);
  if (!data) return null;

  const { fecha, hora } = formatFechaHora(data.evento.fecha_hora);

  return (
    <Popover
      open={open}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableScrollLock
      slotProps={{
        paper: {
          elevation: 0,
          sx: (theme) => ({
            ml: 1,
            minWidth: 230,
            maxWidth: 320,
            overflow: 'hidden',
            borderRadius: theme.palette.custom?.radius?.xs || 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: theme.palette.custom?.shadows?.lg || theme.shadows[4],
          }),
        },
      }}
    >
      <Box
        sx={(theme) => ({
          px: 2,
          py: 1.25,
          bgcolor: theme.palette.custom?.semantic?.secondaryDark || theme.palette.secondary.dark,
          color: theme.palette.secondary.contrastText,
        })}
      >
        <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 900, display: 'block' }}>
          {data.paso.label}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
          <Chip label={fecha} size="small" color="primary" />
          <Chip label={hora} size="small" color="primary" />
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
          {data.evento.mensaje || 'Sin mensaje adicional.'}
        </Typography>
      </Box>
    </Popover>
  );
}

export function OrderProgressMini({
  estadoEnvio,
  estadoPedido,
  historialEventos = [],
  createdAt = null,
  entregadoRepartidoraEn = null,
  entregadoClienteEn = null,
  compact = false,
}) {
  const eventMap = useMemo(
    () => buildEventMap({
      historialEventos,
      createdAt,
      entregadoRepartidoraEn,
      entregadoClienteEn,
    }),
    [historialEventos, createdAt, entregadoRepartidoraEn, entregadoClienteEn],
  );

  const activeStepKey = useMemo(
    () => resolveActiveStepKey({ estadoEnvio, estadoPedido, eventMap }),
    [estadoEnvio, estadoPedido, eventMap],
  );

  const activeIndex = Math.max(getStepIndex(activeStepKey), 0);
  const isIncident = estadoEnvio === 'incidencia';

  const [popover, setPopover] = useState({ anchor: null, data: null });

  const handleStepClick = useCallback((event, data) => {
    setPopover({ anchor: event.currentTarget, data });
  }, []);

  const handleClose = useCallback(() => {
    setPopover({ anchor: null, data: null });
  }, []);

  return (
    <Box role="region" aria-label="Progreso del pedido">
      {PROGRESS_STEPS.map((paso, index) => (
        <StepNode
          key={paso.key}
          paso={paso}
          status={index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending'}
          evento={eventMap[paso.key] ?? null}
          isLast={index === PROGRESS_STEPS.length - 1}
          onClick={handleStepClick}
          compact={compact}
          isIncident={isIncident}
        />
      ))}

      <EventoPopover anchor={popover.anchor} data={popover.data} onClose={handleClose} />
    </Box>
  );
}
