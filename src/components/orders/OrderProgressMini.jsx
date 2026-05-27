import { useState, useCallback } from 'react';
import {
  Box,
  Popover,
  Typography,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ShoppingBag,
  BuildCircle,
  LocalShipping,
  DeliveryDining,
  LocationOn,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material';

// ─── Pasos del pedido ─────────────────────────────────────────────────────────
const PASOS = [
  { key: 'pedido_creado',         label: 'Pedido creado',    Icon: ShoppingBag    },
  { key: 'en_preparacion',        label: 'En preparación',   Icon: BuildCircle    },
  { key: 'entregado_repartidora', label: 'Con repartidora',  Icon: DeliveryDining },
  { key: 'en_transito',           label: 'En tránsito',      Icon: LocalShipping  },
  { key: 'en_destino',            label: 'En destino',       Icon: LocationOn     },
  { key: 'entregado',             label: 'Entregado',        Icon: CheckCircle    },
];

// ─── Colores por estado  ────────
const COLOR = {
  done:    { icon: 'success.main',  bg: 'success.50',  border: 'success.main'  },
  active:  { icon: 'primary.main',  bg: 'primary.50',  border: 'primary.main'  },
  pending: { icon: 'text.disabled', bg: 'grey.100',    border: 'grey.300'      },
};

// ─── Keyframes del pulso ──────────────────────────────────────────────────────

const PULSE_KEYFRAMES = {
  '@keyframes stepPulse': {
    '0%, 100%': { transform: 'scale(1)' },
    '50%':      { transform: 'scale(1.15)' },
  },
};

const indexOfEstado = (key) => PASOS.findIndex((p) => p.key === key);

const formatFechaHora = (isoString) => {
  if (!isoString) return { fecha: '—', hora: '—' };
  const d = new Date(isoString);
  return {
    fecha: d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
    hora:  d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
  };
};

// ─── Nodo del paso ────────────────────────────────────────────────────────────
// Estructura vertical: columna izquierda (círculo + línea) | columna derecha (textos)
// Las 3 animaciones del original React Native están aquí:
//   1. bgcolor con transition 0.4s  → Animated.timing color (inputRange [0,1,2])
//   2. animation: stepPulse          → Animated.loop + Animated.sequence (pulseAnim)
//   3. borderColor con transition    → borderColor: isCurrent ? theme.active : 'transparent'
function StepNode({ paso, status, evento, isLast, onClick }) {
  const pal       = COLOR[status];
  const { Icon }  = paso;
  const isActive  = status === 'active';
  const hasEvento = Boolean(evento);

  const handleClick = useCallback(
    (e) => { if (hasEvento) onClick(e, { paso, evento }); },
    [hasEvento, onClick, paso, evento],
  );

  const circle = (
    <Box
      component="button"
      onClick={handleClick}
      aria-label={`${paso.label}${hasEvento ? ' — ver detalle' : ' — sin información'}`}
      sx={{
        all:     'unset',
        cursor:  hasEvento ? 'pointer' : 'default',
        display: 'flex',
        '&:focus-visible .step-circle': {
          outline: (t) => `2px solid ${t.palette.primary.main}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        className="step-circle"
        sx={{
          width:           40,
          height:          40,
          borderRadius:    '50%',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          flexShrink:      0,

          // Animación 1: transición de color al cambiar de estado
          bgcolor:         pal.bg,
          transition:      'background-color 0.4s ease, border-color 0.4s ease',

          // Animación 3: borde coloreado solo en el paso activo
        
          border:          '2px solid',
          borderColor:     isActive ? 'primary.main' : pal.border,

          // Animación 2: pulso en loop solo en el paso activo
          
          ...(isActive && {
            ...PULSE_KEYFRAMES,
            animation: 'stepPulse 1.4s ease-in-out infinite',
          }),

          // Hover solo si tiene evento (detiene el pulso momentáneamente)
          ...(hasEvento && {
            '&:hover': { animation: 'none', transform: 'scale(1.1)' },
          }),
        }}
      >
        {status === 'pending'
          ? <RadioButtonUnchecked sx={{ fontSize: 18, color: pal.icon }} />
          : <Icon sx={{ fontSize: 18, color: pal.icon, transition: 'color 0.4s ease' }} />
        }
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', mb: isLast ? 0 : 0.5 }}>

      {/* Columna izquierda: círculo + línea conectora vertical */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2 }}>
        {hasEvento
          ? circle
          : (
            <Tooltip title="Sin información aún" placement="right" arrow>
              <span>{circle}</span>
            </Tooltip>
          )
        }

        {/* Línea conectora — 
            La línea interna se llena de verde con transition (height: isCompleted ? '100%' : '0%') */}
        {!isLast && (
          <Box sx={{ width: 2, flexGrow: 1, minHeight: 28, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden', my: 0.5 }}>
            <Box
              sx={{
                width:      '100%',
                bgcolor:    'success.main',
                // Animación: la línea se llena hacia abajo cuando el paso se completa
                height:     status === 'done' ? '100%' : '0%',
                transition: 'height 0.4s ease',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Columna derecha: textos */}
      <Box sx={{ pt: 0.75, pb: isLast ? 0 : 2.5 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isActive ? 700 : 400,
            // Equivale a color: isCompleted || isCurrent ? '#000000' : theme.inactive
            color:      status === 'pending' ? 'text.disabled' : 'text.primary',
            transition: 'color 0.4s ease',
            lineHeight: 1.3,
          }}
        >
          {paso.label}
        </Typography>

        {/* Subtítulo — equivale a step.subtitle, aquí viene de evento.mensaje */}
        {evento?.mensaje && (
          <Typography
            variant="caption"
            sx={{
              color:      'text.secondary',
              display:    'block',
              mt:         0.25,
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

// ─── Popover con fecha, hora y mensaje detallado ──────────────────────────────
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
          elevation: 3,
          sx: { ml: 1, borderRadius: 2, minWidth: 220, maxWidth: 300, overflow: 'hidden' },
        },
      }}
    >
      <Box sx={{ bgcolor: 'primary.main', px: 2, py: 1.25 }}>
        <Typography variant="caption" sx={{ color: 'primary.contrastText', fontWeight: 700, display: 'block' }}>
          {data.paso.label}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
          <Chip label={fecha} size="small" sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', fontSize: 11, height: 20 }} />
          <Chip label={hora}  size="small" sx={{ bgcolor: 'primary.dark', color: 'primary.contrastText', fontSize: 11, height: 20 }} />
        </Box>
      </Box>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
          {data.evento.mensaje || 'Sin mensaje adicional.'}
        </Typography>
      </Box>
    </Popover>
  );
}

// ─── OrderProgressMini ────────────────────────────────────────────────────────
// Props:
//   estadoEnvio      → clave del paso activo ('en_transito', 'entregado', etc.)
//   historialEventos → [{ estado, fecha_hora, mensaje }]
export function OrderProgressMini({ estadoEnvio, historialEventos = [] }) {
  const activeIndex = indexOfEstado(estadoEnvio);

  const eventoMap = Object.fromEntries(
    historialEventos.map((ev) => [ev.estado, ev]),
  );

  const [popover, setPopover] = useState({ anchor: null, data: null });

  const handleStepClick = useCallback((e, data) => {
    setPopover({ anchor: e.currentTarget, data });
  }, []);

  const handleClose = useCallback(() => {
    setPopover({ anchor: null, data: null });
  }, []);

  return (
    <Box role="region" aria-label="Progreso del pedido">
      {PASOS.map((paso, i) => (
        <StepNode
          key={paso.key}
          paso={paso}
          status={i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'pending'}
          evento={eventoMap[paso.key] ?? null}
          isLast={i === PASOS.length - 1}
          onClick={handleStepClick}
        />
      ))}

      <EventoPopover anchor={popover.anchor} data={popover.data} onClose={handleClose} />
    </Box>
  );
}
