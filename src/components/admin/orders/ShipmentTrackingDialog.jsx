// Diálogo administrativo para registrar o actualizar el seguimiento de envío.
// Este módulo solo gestiona logística: transportista, guía, rastreo e incidencias.

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import {
  SHIPPING_REQUIRED_ADVANCE_VALUES,
  getShippingStatusLabel,
} from '../../../adapters/orderAdapter';
import { ErrorMessage } from '../../common/ErrorMessage';

const SHIPPING_FLOW = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'entregado_repartidora', label: 'Entregado a transportista' },
  { value: 'en_transito', label: 'En tránsito' },
  { value: 'en_destino', label: 'En destino' },
  { value: 'entregado', label: 'Entregado al cliente' },
];

const getActiveStep = (status = 'pendiente') => {
  if (status === 'incidencia') return 1;
  const index = SHIPPING_FLOW.findIndex((step) => step.value === status);
  return Math.max(index, 0);
};

const buildAction = ({ value, title, description, icon, severity = 'primary' }) => ({
  value,
  title,
  description,
  icon,
  severity,
});

const getAvailableShippingActions = (currentStatus = 'pendiente') => {
  if (currentStatus === 'entregado') return [];

  if (currentStatus === 'incidencia') {
    return [
      buildAction({
        value: 'en_transito',
        title: 'Reanudar en tránsito',
        description: 'La incidencia fue atendida y el paquete continúa en ruta.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'en_destino',
        title: 'Marcar en destino',
        description: 'El paquete llegó a la zona o agencia de destino.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'entregado',
        title: 'Entregado al cliente',
        description: 'Cierra el seguimiento logístico.',
        icon: <DoneRoundedIcon />,
        severity: 'success',
      }),
    ];
  }

  if (!currentStatus || currentStatus === 'pendiente' || currentStatus === 'preparando') {
    return [
      buildAction({
        value: 'entregado_repartidora',
        title: 'Entregado a transportista',
        description: 'Registra empresa, guía y datos de rastreo.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'incidencia',
        title: 'Registrar incidencia',
        description: 'Usa esta opción si el despacho tuvo un problema.',
        icon: <WarningAmberRoundedIcon />,
        severity: 'warning',
      }),
    ];
  }

  if (currentStatus === 'entregado_repartidora') {
    return [
      buildAction({
        value: 'en_transito',
        title: 'Marcar en tránsito',
        description: 'El paquete ya se encuentra en ruta.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de transporte o entrega.',
        icon: <WarningAmberRoundedIcon />,
        severity: 'warning',
      }),
    ];
  }

  if (currentStatus === 'en_transito') {
    return [
      buildAction({
        value: 'en_destino',
        title: 'Marcar en destino',
        description: 'El paquete llegó a la ciudad, agencia o zona final.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'entregado',
        title: 'Entregado al cliente',
        description: 'El cliente recibió el paquete.',
        icon: <DoneRoundedIcon />,
        severity: 'success',
      }),
      buildAction({
        value: 'incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de transporte o entrega.',
        icon: <WarningAmberRoundedIcon />,
        severity: 'warning',
      }),
    ];
  }

  if (currentStatus === 'en_destino') {
    return [
      buildAction({
        value: 'entregado',
        title: 'Entregado al cliente',
        description: 'Cierra el seguimiento logístico.',
        icon: <DoneRoundedIcon />,
        severity: 'success',
      }),
      buildAction({
        value: 'incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de entrega.',
        icon: <WarningAmberRoundedIcon />,
        severity: 'warning',
      }),
    ];
  }

  return [];
};

const ActionCard = ({ action, selected, disabled, onSelect }) => {
  const theme = useTheme();
  const color = action.severity === 'success'
    ? theme.palette.success.main
    : action.severity === 'warning'
      ? theme.palette.warning.main
      : theme.palette.primary.main;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: selected ? color : 'divider',
        bgcolor: selected ? alpha(color, 0.08) : 'background.paper',
        boxShadow: selected ? 2 : 0,
      }}
    >
      <CardActionArea disabled={disabled} onClick={onSelect} sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={1}>
            <Box sx={{ color, display: 'flex' }}>{action.icon}</Box>
            <Typography variant="subtitle2" fontWeight={900}>{action.title}</Typography>
            <Typography variant="body2" color="text.secondary">{action.description}</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const ShipmentTrackingDialog = ({
  open,
  order,
  form,
  error,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}) => {
  const currentStatus = order?.estado_envio || form?.estadoEnvioActual || 'pendiente';
  const selectedStatus = form?.estadoEnvio || '';
  const actions = getAvailableShippingActions(currentStatus);
  const selectedAction = actions.find((action) => action.value === selectedStatus) || null;
  const mustCompleteTransport = SHIPPING_REQUIRED_ADVANCE_VALUES.includes(selectedStatus);

  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange?.(name, value);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle sx={{ pr: 6 }}>
          Actualizar envío
          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            aria-label="Cerrar"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <ErrorMessage message={error} />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>Pedido</Typography>
                <Typography variant="body2" fontWeight={800}>{order?.numero_pedido || form?.numeroPedido || '-'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>Estado actual</Typography>
                <Typography variant="body2">{getShippingStatusLabel(currentStatus)}</Typography>
              </Grid>
            </Grid>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900}>Flujo logístico</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Actualiza solo la etapa real del paquete.
                    </Typography>
                  </Box>
                  <Stepper
                    activeStep={getActiveStep(currentStatus)}
                    alternativeLabel
                    sx={{
                      overflowX: 'auto',
                      pb: 1,
                      '& .MuiStepLabel-label': {
                        typography: 'caption',
                        fontWeight: 700,
                      },
                    }}
                  >
                    {SHIPPING_FLOW.map((step) => (
                      <Step key={step.value}>
                        <StepLabel>{step.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Stack>
              </CardContent>
            </Card>

            {currentStatus === 'incidencia' && (
              <Alert severity="warning">
                Este envío tiene una incidencia. Selecciona la acción que corresponda cuando el caso esté atendido.
              </Alert>
            )}

            {actions.length === 0 ? (
              <Alert severity="info">No hay acciones logísticas disponibles para el estado actual.</Alert>
            ) : (
              <Grid container spacing={1.5}>
                {actions.map((action) => (
                  <Grid key={action.value} size={{ xs: 12, md: actions.length > 2 ? 4 : 6 }}>
                    <ActionCard
                      action={action}
                      selected={selectedStatus === action.value}
                      disabled={loading}
                      onSelect={() => onChange?.('estadoEnvio', action.value)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {selectedStatus && (
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="empresaEnvio"
                    label="Empresa transportista"
                    value={form?.empresaEnvio || ''}
                    onChange={handleChange}
                    required={mustCompleteTransport}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="numeroSeguimiento"
                    label="Número de guía"
                    value={form?.numeroSeguimiento || ''}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    name="urlSeguimiento"
                    label="Enlace de rastreo"
                    value={form?.urlSeguimiento || ''}
                    onChange={handleChange}
                    type="url"
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}

            <TextField
              name="comentario"
              label="Comentario de envío"
              value={form?.comentario || ''}
              onChange={handleChange}
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !selectedAction || (mustCompleteTransport && !form?.empresaEnvio?.trim())}
          >
            {loading ? 'Guardando...' : selectedAction?.title || 'Guardar envío'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
