// Diálogo administrativo para avanzar un pedido con flujo guiado.
// Separa avance operativo, entrega directa y seguimiento logístico.

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { ErrorMessage } from '../../common/ErrorMessage';
import {
  SHIPPING_REQUIRED_ADVANCE_VALUES,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getShippingStatusLabel,
} from '../../../adapters/orderAdapter';

const APPROVED_PAYMENT_STATES = ['aprobado', 'pagado'];
const ACTIVE_SHIPPING_STATES = ['entregado_repartidora', 'en_transito', 'en_destino', 'entregado', 'incidencia'];

const DIRECT_DELIVERY_WORDS = ['recojo', 'tienda', 'mostrador', 'directa', 'sin_envio', 'sin envio'];
const TRANSPORT_DELIVERY_WORDS = ['envio', 'envío', 'domicilio', 'agencia', 'transportista', 'courier', 'delivery'];

const getAdvanceType = (value = '') => value.split(':')[0] || '';
const getAdvanceStatus = (value = '') => value.split(':')[1] || '';
const isShippingAdvance = (value = '') => getAdvanceType(value) === 'envio';
const requiresTransportData = (value = '') => {
  const status = getAdvanceStatus(value);
  return SHIPPING_REQUIRED_ADVANCE_VALUES.includes(status);
};

const normalizeObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const normalizeText = (value = '') => String(value || '').trim().toLowerCase();

const getDeliveryMode = (order = {}) => {
  const deliveryData = normalizeObject(order.datos_entrega || order.direccion_entrega);
  const rawType = normalizeText(order.tipo_entrega || deliveryData.tipo_entrega || deliveryData.tipo || '');

  if (DIRECT_DELIVERY_WORDS.some((word) => rawType.includes(word))) return 'directa';
  if (TRANSPORT_DELIVERY_WORDS.some((word) => rawType.includes(word))) return 'transporte';

  if (order.empresa_envio || ACTIVE_SHIPPING_STATES.includes(order.estado_envio)) return 'transporte';

  return 'por_definir';
};

const getDeliveryLabel = (deliveryMode) => {
  if (deliveryMode === 'transporte') return 'Envío por transportista';
  if (deliveryMode === 'directa') return 'Recojo o entrega directa';
  return 'Entrega por definir';
};

const getFlowSteps = ({ deliveryMode, paymentApproved }) => {
  const paymentStep = paymentApproved ? 'Pago confirmado' : 'Pago pendiente';

  if (deliveryMode === 'transporte') {
    return [
      paymentStep,
      'En preparación',
      'Listo para despacho',
      'Entregado a transportista',
      'En tránsito',
      'En destino',
      'Entregado al cliente',
    ];
  }

  if (deliveryMode === 'directa') {
    return [paymentStep, 'En preparación', 'Listo para entrega', 'Entregado directamente'];
  }

  return [paymentStep, 'En preparación', 'Listo para entrega/despacho', 'Entrega final'];
};

const getActiveStep = ({ order, deliveryMode, paymentApproved }) => {
  const orderStatus = order?.estado_pedido || '';
  const shippingStatus = order?.estado_envio || 'pendiente';

  if (!paymentApproved) return 0;
  if (orderStatus === 'entregado' || shippingStatus === 'entregado') {
    return deliveryMode === 'transporte' ? 6 : 3;
  }
  if (shippingStatus === 'en_destino') return 5;
  if (shippingStatus === 'en_transito') return 4;
  if (shippingStatus === 'entregado_repartidora') return 3;
  if (orderStatus === 'enviado') return 3;
  if (orderStatus === 'listo_para_envio') return 2;
  if (orderStatus === 'en_preparacion' || orderStatus === 'preparando') return 1;

  return 0;
};

const buildAction = ({
  value,
  title,
  description,
  icon,
  severity = 'primary',
}) => ({ value, title, description, icon, severity });

const getAvailableActions = ({ order, deliveryMode, paymentApproved }) => {
  if (!paymentApproved) return [];

  const orderStatus = order?.estado_pedido || '';
  const shippingStatus = order?.estado_envio || 'pendiente';

  if (orderStatus === 'cancelado' || orderStatus === 'entregado' || shippingStatus === 'entregado') {
    return [];
  }

  if (shippingStatus === 'incidencia') {
    return [
      buildAction({
        value: 'envio:en_transito',
        title: 'Reanudar en tránsito',
        description: 'La incidencia fue atendida y el paquete continúa en ruta.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'envio:en_destino',
        title: 'Marcar en destino',
        description: 'El paquete llegó a la zona o agencia de destino.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'envio:entregado',
        title: 'Entregado al cliente',
        description: 'El transportista confirmó la entrega final.',
        icon: <DoneRoundedIcon />,
        severity: 'success',
      }),
    ];
  }

  if (orderStatus === 'confirmado' || orderStatus === 'pagado') {
    return [
      buildAction({
        value: 'pedido:en_preparacion',
        title: 'Marcar en preparación',
        description: 'El equipo empieza a separar, producir o preparar el pedido.',
        icon: <Inventory2OutlinedIcon />,
      }),
    ];
  }

  if (orderStatus === 'en_preparacion' || orderStatus === 'preparando') {
    return [
      buildAction({
        value: 'pedido:listo_para_envio',
        title: deliveryMode === 'transporte' ? 'Listo para despacho' : 'Listo para entrega',
        description: deliveryMode === 'transporte'
          ? 'El pedido ya puede entregarse al transportista.'
          : 'El pedido ya puede entregarse directamente o ser recogido.',
        icon: deliveryMode === 'transporte' ? <LocalShippingOutlinedIcon /> : <StorefrontOutlinedIcon />,
      }),
    ];
  }

  if (orderStatus === 'listo_para_envio') {
    if (deliveryMode === 'transporte') {
      return [
        buildAction({
          value: 'envio:entregado_repartidora',
          title: 'Entregado a transportista',
          description: 'Registra empresa, guía y datos de rastreo.',
          icon: <LocalShippingOutlinedIcon />,
        }),
        buildAction({
          value: 'envio:incidencia',
          title: 'Registrar incidencia',
          description: 'Usa esta opción si el despacho tiene un problema.',
          icon: <WarningAmberRoundedIcon />,
          severity: 'warning',
        }),
      ];
    }

    if (deliveryMode === 'directa') {
      return [
        buildAction({
          value: 'pedido:entregado',
          title: 'Entregado directamente',
          description: 'Cierra el pedido por recojo, mostrador o entrega interna.',
          icon: <DoneRoundedIcon />,
          severity: 'success',
        }),
      ];
    }

    return [
      buildAction({
        value: 'pedido:entregado',
        title: 'Entregado directamente',
        description: 'Usa esta opción si no habrá transportista externo.',
        icon: <DoneRoundedIcon />,
        severity: 'success',
      }),
      buildAction({
        value: 'envio:entregado_repartidora',
        title: 'Entregado a transportista',
        description: 'Usa esta opción si el pedido será enviado por courier, agencia o transportista.',
        icon: <LocalShippingOutlinedIcon />,
      }),
    ];
  }

  if (orderStatus === 'enviado' || shippingStatus === 'entregado_repartidora') {
    return [
      buildAction({
        value: 'envio:en_transito',
        title: 'Marcar en tránsito',
        description: 'El paquete ya se encuentra en ruta.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'envio:incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de transporte o entrega.',
        icon: <WarningAmberRoundedIcon />,
        severity: 'warning',
      }),
    ];
  }

  if (shippingStatus === 'en_transito') {
    return [
      buildAction({
        value: 'envio:en_destino',
        title: 'Marcar en destino',
        description: 'El paquete llegó a la ciudad, agencia o zona final.',
        icon: <LocalShippingOutlinedIcon />,
      }),
      buildAction({
        value: 'envio:entregado',
        title: 'Entregado al cliente',
        description: 'El cliente recibió el paquete.',
        icon: <DoneRoundedIcon />,
        severity: 'success',
      }),
      buildAction({
        value: 'envio:incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de transporte o entrega.',
        icon: <WarningAmberRoundedIcon />,
        severity: 'warning',
      }),
    ];
  }

  if (shippingStatus === 'en_destino') {
    return [
      buildAction({
        value: 'envio:entregado',
        title: 'Entregado al cliente',
        description: 'Cierra el seguimiento logístico.',
        icon: <DoneRoundedIcon />,
        severity: 'success',
      }),
      buildAction({
        value: 'envio:incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de entrega.',
        icon: <WarningAmberRoundedIcon />,
        severity: 'warning',
      }),
    ];
  }

  return [];
};

const getSelectedAction = (actions, value) => actions.find((action) => action.value === value) || null;

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
        transition: theme.transitions.create(['border-color', 'background-color', 'box-shadow']),
        boxShadow: selected ? 2 : 0,
      }}
    >
      <CardActionArea disabled={disabled} onClick={onSelect} sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={1.25}>
            <Box sx={{ color, display: 'flex' }}>{action.icon}</Box>
            <Typography variant="subtitle2" fontWeight={900}>{action.title}</Typography>
            <Typography variant="body2" color="text.secondary">{action.description}</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export const OrderAdvanceDialog = ({
  open,
  order,
  form,
  error,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}) => {
  const theme = useTheme();
  const selectedAdvance = form?.avanceNuevo || '';
  const selectedShippingStatus = getAdvanceStatus(selectedAdvance);
  const showShippingFields = isShippingAdvance(selectedAdvance);
  const mustCompleteTransport = requiresTransportData(selectedAdvance);
  const paymentStatus = order?.estado_pago || form?.estadoPago || '';
  const paymentApproved = APPROVED_PAYMENT_STATES.includes(paymentStatus);
  const deliveryMode = getDeliveryMode(order || {});
  const flowSteps = getFlowSteps({ deliveryMode, paymentApproved });
  const activeStep = getActiveStep({ order: order || {}, deliveryMode, paymentApproved });
  const actions = getAvailableActions({ order: order || {}, deliveryMode, paymentApproved });
  const selectedAction = getSelectedAction(actions, selectedAdvance);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <Box component="form" onSubmit={onSubmit}>
        <DialogTitle sx={{ pr: 6 }}>
          Actualizar avance del pedido
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="N° pedido" value={form?.numeroPedido || order?.numero_pedido || ''} disabled fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Estado pedido" value={getOrderStatusLabel(form?.estadoActual || order?.estado_pedido)} disabled fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Pago" value={getPaymentStatusLabel(paymentStatus)} disabled fullWidth />
              </Grid>
            </Grid>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={900}>Flujo del pedido</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getDeliveryLabel(deliveryMode)}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      color={paymentApproved ? 'success' : 'warning'}
                      variant="outlined"
                      label={paymentApproved ? 'Pago aprobado' : 'Pago pendiente'}
                    />
                  </Stack>

                  <Stepper
                    activeStep={activeStep}
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
                    {flowSteps.map((step) => (
                      <Step key={step}>
                        <StepLabel>{step}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Stack>
              </CardContent>
            </Card>

            {!paymentApproved && (
              <Alert severity="warning">
                Este pedido aún no tiene pago aprobado. La preparación y el despacho se habilitan desde el módulo Pagos y comprobantes cuando el pago esté validado.
              </Alert>
            )}

            {paymentApproved && actions.length === 0 && (
              <Alert severity="info">
                No hay acciones de avance disponibles para el estado actual del pedido.
              </Alert>
            )}

            {actions.length > 0 && (
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={900}>Siguiente acción</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Selecciona solo el avance que corresponde al estado real del pedido.
                  </Typography>
                </Box>

                <Grid container spacing={1.5}>
                  {actions.map((action) => (
                    <Grid key={action.value} size={{ xs: 12, sm: actions.length > 1 ? 6 : 12 }}>
                      <ActionCard
                        action={action}
                        selected={selectedAdvance === action.value}
                        disabled={loading}
                        onSelect={() => onChange?.('avanceNuevo', action.value)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )}

            {showShippingFields && (
              <>
                <Divider />
                <Alert severity={selectedShippingStatus === 'incidencia' ? 'warning' : 'info'}>
                  {selectedShippingStatus === 'entregado_repartidora'
                    ? 'Registra los datos del transportista para que el equipo pueda hacer seguimiento del paquete.'
                    : 'Puedes actualizar o completar los datos de transporte si cambiaron.'}
                </Alert>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required={mustCompleteTransport}
                      fullWidth
                      name="empresaEnvio"
                      label="Empresa transportista"
                      value={form?.empresaEnvio || ''}
                      onChange={(event) => onChange?.('empresaEnvio', event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="numeroSeguimiento"
                      label="Número de guía"
                      value={form?.numeroSeguimiento || ''}
                      onChange={(event) => onChange?.('numeroSeguimiento', event.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      name="urlSeguimiento"
                      label="Enlace de rastreo"
                      type="url"
                      value={form?.urlSeguimiento || ''}
                      onChange={(event) => onChange?.('urlSeguimiento', event.target.value)}
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <TextField
              multiline
              minRows={3}
              label={showShippingFields ? 'Comentario de envío' : 'Comentario interno'}
              value={form?.comentario || ''}
              onChange={(event) => onChange?.('comentario', event.target.value)}
            />

            {showShippingFields && !form?.empresaEnvio?.trim() && mustCompleteTransport && (
              <Typography variant="caption" color="error.main">
                La empresa transportista es obligatoria para registrar este avance.
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={
              loading ||
              !selectedAction ||
              !paymentApproved ||
              (mustCompleteTransport && !form?.empresaEnvio?.trim())
            }
          >
            {loading ? 'Guardando...' : selectedAction?.title || 'Guardar avance'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
