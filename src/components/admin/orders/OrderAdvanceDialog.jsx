// Diálogo administrativo para avanzar un pedido con flujo guiado.

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  Step,
  StepButton,
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
import { CarrierTrackingFields } from './CarrierTrackingFields';

const APPROVED_PAYMENT_STATES = ['aprobado', 'pagado'];

const TRACKING_NUMBER_REQUIRED_STATUSES = [
  'en_transito',
  'en_destino',
  'entregado',
];

const ACTIVE_SHIPPING_STATES = [
  'entregado_repartidora',
  'en_transito',
  'en_destino',
  'entregado',
  'incidencia',
];

const DIRECT_DELIVERY_WORDS = [
  'recojo',
  'tienda',
  'mostrador',
  'directa',
  'sin_envio',
  'sin envio',
];

const TRANSPORT_DELIVERY_WORDS = [
  'envio',
  'envío',
  'domicilio',
  'agencia',
  'transportista',
  'courier',
  'delivery',
];

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

  const rawType = normalizeText(
    order.tipo_entrega ||
      deliveryData.tipo_entrega ||
      deliveryData.tipo ||
      ''
  );

  if (DIRECT_DELIVERY_WORDS.some((word) => rawType.includes(word))) {
    return 'directa';
  }

  if (TRANSPORT_DELIVERY_WORDS.some((word) => rawType.includes(word))) {
    return 'transporte';
  }

  if (order.empresa_envio || order.transportista_id || ACTIVE_SHIPPING_STATES.includes(order.estado_envio)) {
    return 'transporte';
  }

  return 'por_definir';
};

const getDeliveryLabel = (deliveryMode) => {
  if (deliveryMode === 'transporte') return 'Envío por transportista';
  if (deliveryMode === 'directa') return 'Recojo o entrega directa';
  return 'Entrega por definir';
};

const getActionColor = (theme, severity = 'primary') => {
  if (severity === 'success') return theme.palette.success.main;
  if (severity === 'warning') return theme.palette.warning.main;
  return theme.palette.primary.main;
};

const buildAction = ({
  value,
  title,
  description,
  icon,
  severity = 'primary',
}) => ({
  value,
  title,
  description,
  icon,
  severity,
});

const getAvailableActions = ({ order, deliveryMode, paymentApproved }) => {
  if (!paymentApproved) return [];

  const orderStatus = order?.estado_pedido || '';
  const shippingStatus = order?.estado_envio || 'pendiente';

  if (
    orderStatus === 'cancelado' ||
    orderStatus === 'entregado' ||
    shippingStatus === 'entregado'
  ) {
    return [];
  }

  if (shippingStatus === 'incidencia') {
    return [
      buildAction({
        value: 'envio:en_transito',
        title: 'Reanudar en tránsito',
        description: 'La incidencia fue atendida y el paquete continúa en ruta.',
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
      }),
      buildAction({
        value: 'envio:en_destino',
        title: 'Marcar en destino',
        description: 'El paquete llegó a la zona o agencia de destino.',
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
      }),
      buildAction({
        value: 'envio:entregado',
        title: 'Entregado',
        description: 'El transportista confirmó la entrega final.',
        icon: <DoneRoundedIcon fontSize="small" />,
        severity: 'success',
      }),
    ];
  }

  if (orderStatus === 'confirmado' || orderStatus === 'pagado') {
    return [
      buildAction({
        value: 'pedido:en_preparacion',
        title: 'Preparación',
        description: 'El equipo empieza a separar, producir o preparar el pedido.',
        icon: <Inventory2OutlinedIcon fontSize="small" />,
      }),
    ];
  }

  if (orderStatus === 'en_preparacion' || orderStatus === 'preparando') {
    return [
      buildAction({
        value: 'pedido:listo_para_envio',
        title: deliveryMode === 'transporte' ? 'Listo despacho' : 'Listo entrega',
        description:
          deliveryMode === 'transporte'
            ? 'El pedido ya puede entregarse al transportista.'
            : 'El pedido ya puede entregarse directamente o ser recogido.',
        icon:
          deliveryMode === 'transporte' ? (
            <LocalShippingOutlinedIcon fontSize="small" />
          ) : (
            <StorefrontOutlinedIcon fontSize="small" />
          ),
      }),
    ];
  }

  if (orderStatus === 'listo_para_envio') {
    if (deliveryMode === 'transporte') {
      return [
        buildAction({
          value: 'envio:entregado_repartidora',
          title: 'Transportista',
          description: 'Registra empresa, guía y datos de rastreo.',
          icon: <LocalShippingOutlinedIcon fontSize="small" />,
        }),
        buildAction({
          value: 'envio:incidencia',
          title: 'Registrar incidencia',
          description: 'Usa esta opción si el despacho tiene un problema.',
          icon: <WarningAmberRoundedIcon fontSize="small" />,
          severity: 'warning',
        }),
      ];
    }

    if (deliveryMode === 'directa') {
      return [
        buildAction({
          value: 'pedido:entregado',
          title: 'Entregado',
          description: 'Cierra el pedido por recojo, mostrador o entrega interna.',
          icon: <DoneRoundedIcon fontSize="small" />,
          severity: 'success',
        }),
      ];
    }

    return [
      buildAction({
        value: 'pedido:entregado',
        title: 'Entrega directa',
        description: 'Entregado sin transportista externo.',
        icon: <StorefrontOutlinedIcon fontSize="small" />,
        severity: 'success',
      }),
      buildAction({
        value: 'envio:entregado_repartidora',
        title: 'Transportista',
        description: 'Enviado por empresa de transporte',
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
      }),
    ];
  }

  if (orderStatus === 'enviado' || shippingStatus === 'entregado_repartidora') {
    return [
      buildAction({
        value: 'envio:en_transito',
        title: 'Tránsito',
        description: 'El paquete ya se encuentra en ruta.',
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
      }),
      buildAction({
        value: 'envio:incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de transporte o entrega.',
        icon: <WarningAmberRoundedIcon fontSize="small" />,
        severity: 'warning',
      }),
    ];
  }

  if (shippingStatus === 'en_transito') {
    return [
      buildAction({
        value: 'envio:en_destino',
        title: 'Destino',
        description: 'El paquete llegó a la ciudad, agencia o zona final.',
        icon: <LocalShippingOutlinedIcon fontSize="small" />,
      }),
      buildAction({
        value: 'envio:entregado',
        title: 'Entregado',
        description: 'El cliente recibió el paquete.',
        icon: <DoneRoundedIcon fontSize="small" />,
        severity: 'success',
      }),
      buildAction({
        value: 'envio:incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de transporte o entrega.',
        icon: <WarningAmberRoundedIcon fontSize="small" />,
        severity: 'warning',
      }),
    ];
  }

  if (shippingStatus === 'en_destino') {
    return [
      buildAction({
        value: 'envio:entregado',
        title: 'Entregado',
        description: 'Cierra el seguimiento logístico.',
        icon: <DoneRoundedIcon fontSize="small" />,
        severity: 'success',
      }),
      buildAction({
        value: 'envio:incidencia',
        title: 'Registrar incidencia',
        description: 'Registra un problema de entrega.',
        icon: <WarningAmberRoundedIcon fontSize="small" />,
        severity: 'warning',
      }),
    ];
  }

  return [];
};

const getSelectedAction = (actions, value) => {
  return actions.find((action) => action.value === value) || null;
};

const getCurrentFlowStepKey = ({ order, paymentApproved }) => {
  const orderStatus = order?.estado_pedido || '';
  const shippingStatus = order?.estado_envio || 'pendiente';

  if (!paymentApproved) return 'pago';
  if (orderStatus === 'entregado' || shippingStatus === 'entregado') return 'entregado';
  if (shippingStatus === 'en_destino') return 'destino';
  if (shippingStatus === 'en_transito') return 'transito';
  if (shippingStatus === 'entregado_repartidora') return 'transportista';
  if (orderStatus === 'enviado') return 'transportista';
  if (orderStatus === 'listo_para_envio') return 'listo';
  if (orderStatus === 'en_preparacion' || orderStatus === 'preparando') return 'preparacion';

  return 'pago';
};

const getBaseFlowSteps = ({ deliveryMode, paymentApproved }) => {
  const paymentLabel = paymentApproved ? 'Pago confirmado' : 'Pago pendiente';

  if (deliveryMode === 'transporte') {
    return [
      { key: 'pago', label: paymentLabel },
      { key: 'preparacion', label: 'Preparación', actionValue: 'pedido:en_preparacion' },
      { key: 'listo', label: 'Listo despacho', actionValue: 'pedido:listo_para_envio' },
      { key: 'transportista', label: 'Transportista', actionValue: 'envio:entregado_repartidora' },
      { key: 'transito', label: 'Tránsito', actionValue: 'envio:en_transito' },
      { key: 'destino', label: 'Destino', actionValue: 'envio:en_destino' },
      { key: 'entregado', label: 'Entregado', actionValue: 'envio:entregado' },
    ];
  }

  if (deliveryMode === 'directa') {
    return [
      { key: 'pago', label: paymentLabel },
      { key: 'preparacion', label: 'Preparación', actionValue: 'pedido:en_preparacion' },
      { key: 'listo', label: 'Listo entrega', actionValue: 'pedido:listo_para_envio' },
      { key: 'entregado', label: 'Entregado', actionValue: 'pedido:entregado' },
    ];
  }

  return [
    { key: 'pago', label: paymentLabel },
    { key: 'preparacion', label: 'Preparación', actionValue: 'pedido:en_preparacion' },
    { key: 'listo', label: 'Listo', actionValue: 'pedido:listo_para_envio' },
  ];
};

const buildSelectableFlowSteps = ({
  order,
  deliveryMode,
  paymentApproved,
  actions,
}) => {
  const availableActionMap = new Map(actions.map((action) => [action.value, action]));
  const currentKey = getCurrentFlowStepKey({ order, paymentApproved });

  return getBaseFlowSteps({ deliveryMode, paymentApproved }).map((step) => {
    const action = step.actionValue ? availableActionMap.get(step.actionValue) : null;

    return {
      ...step,
      action,
      isSelectable: Boolean(action),
      severity: action?.severity || 'primary',
      description: action?.description || '',
      icon: action?.icon || null,
      isCurrent: step.key === currentKey,
    };
  });
};

const getStepIndexByKey = (steps, key) => {
  const index = steps.findIndex((step) => step.key === key);
  return index >= 0 ? index : 0;
};

const getStepStateText = ({
  isSelected,
  isCurrent,
  isSelectable,
  isCompleted,
}) => {
  if (isSelected) return 'Seleccionado';
  if (isCurrent) return 'Actual';
  if (isSelectable) return 'Elegir';
  if (isCompleted) return 'Completado';
  return 'No disponible';
};

const getStepChipProps = ({
  isSelected,
  isCurrent,
  isSelectable,
  isCompleted,
}) => {
  if (isSelected) return { color: 'success', variant: 'filled' };
  if (isCurrent) return { color: 'primary', variant: 'outlined' };
  if (isSelectable) return { color: 'default', variant: 'outlined' };
  if (isCompleted) return { color: 'success', variant: 'outlined' };
  return { color: 'default', variant: 'outlined' };
};

const StepStateChip = ({
  isSelected,
  isCurrent,
  isSelectable,
  isCompleted,
}) => {
  const chipProps = getStepChipProps({
    isSelected,
    isCurrent,
    isSelectable,
    isCompleted,
  });

  return (
    <Chip
      size="small"
      label={getStepStateText({
        isSelected,
        isCurrent,
        isSelectable,
        isCompleted,
      })}
      color={chipProps.color}
      variant={chipProps.variant}
      sx={{
        height: 22,
        fontSize: '0.68rem',
        fontWeight: 800,
      }}
    />
  );
};

const SelectableGeneralFlowStepper = ({
  steps,
  currentStepIndex,
  selectedAdvance,
  loading,
  onSelect,
}) => {
  const theme = useTheme();

  const stepWidth = 190;
  const minWidth = Math.max(steps.length * stepWidth, 640);

  return (
    <Box
      sx={{
        width: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        pt: 1,
        pb: 1,
        scrollbarGutter: 'stable',
      }}
    >
      <Box
        sx={{
          minWidth: {
            xs: minWidth,
            md: steps.length > 4 ? minWidth : '100%',
          },
          px: {
            xs: 2,
            sm: 2.5,
            md: 3,
          },
          pt: 3,
          pb: 3,
          overflow: 'visible',
        }}
      >
        <Stepper
          nonLinear
          alternativeLabel
          activeStep={currentStepIndex}
          sx={{
            overflow: 'visible',
            '& .MuiStep-root': {
              px: {
                xs: 1.25,
                sm: 1.5,
                md: 1.75,
              },
              minWidth: 0,
              overflow: 'visible',
            },
            '& .MuiStepButton-root': {
              overflow: 'visible',
            },
            '& .MuiStepLabel-root': {
              overflow: 'visible',
            },
            '& .MuiStepLabel-label': {
              typography: 'caption',
              fontWeight: 900,
              mt: 0.75,
              whiteSpace: 'normal',
              lineHeight: 1.15,
            },
            '& .MuiStepIcon-root.Mui-active': {
              color: 'primary.main',
            },
            '& .MuiStepIcon-root.Mui-completed': {
              color: 'success.main',
            },
            '& .MuiStepConnector-line': {
              borderColor: 'divider',
            },
          }}
        >
          {steps.map((step, index) => {
            const isSelected = selectedAdvance === step.actionValue;
            const isCompleted = index < currentStepIndex;
            const isDisabled = !step.isSelectable || loading;
            const color = getActionColor(theme, step.severity);

            return (
              <Step key={step.key} completed={isCompleted}>
                <StepButton
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    if (!step.actionValue) return;
                    onSelect?.(step.actionValue);
                  }}
                  optional={
                    <Box
                      sx={{
                        mt: 0.75,
                        display: 'grid',
                        justifyItems: 'center',
                        gap: 0.5,
                        minHeight: 58,
                      }}
                    >
                      {step.icon && (
                        <Box
                          sx={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            color,
                            bgcolor: alpha(color, 0.1),
                          }}
                        >
                          {step.icon}
                        </Box>
                      )}

                      <StepStateChip
                        isSelected={isSelected}
                        isCurrent={step.isCurrent}
                        isSelectable={step.isSelectable}
                        isCompleted={isCompleted}
                      />
                    </Box>
                  }
                  sx={{
                    width: '100%',
                    minHeight: 106,
                    borderRadius: 2.5,
                    px: 0.75,
                    py: 0.9,
                    overflow: 'visible',
                    border: '1px solid',
                    borderColor: isSelected
                      ? color
                      : step.isCurrent
                        ? 'primary.main'
                        : 'transparent',
                    bgcolor: isSelected
                      ? alpha(color, 0.08)
                      : step.isCurrent
                        ? alpha(theme.palette.primary.main, 0.06)
                        : 'transparent',
                    boxShadow: isSelected ? 2 : 0,
                    transition: theme.transitions.create([
                      'border-color',
                      'background-color',
                      'box-shadow',
                    ]),
                    '&:hover': {
                      bgcolor: step.isSelectable
                        ? alpha(color, 0.08)
                        : step.isCurrent
                          ? alpha(theme.palette.primary.main, 0.06)
                          : 'transparent',
                      borderColor: step.isSelectable
                        ? color
                        : step.isCurrent
                          ? 'primary.main'
                          : 'transparent',
                    },
                    '&.Mui-disabled': {
                      opacity: isCompleted || step.isCurrent ? 1 : 0.42,
                    },
                  }}
                >
                  {step.label}
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
      </Box>
    </Box>
  );
};
//Diagrama de proceso de envio
  const DeliveryFlowBranchDiagram = ({
    actions,
    selectedAdvance,
    loading,
    onSelect,
  }) => {
    const theme = useTheme();

    if (!actions.length) return null;

    return (
      <Paper
        variant="outlined"
        sx={{
          p: {
            xs: 1.75,
            sm: 2.25,
            md: 2.5,
          },
          borderRadius: 2.5,
          bgcolor: alpha(theme.palette.background.default, 0.72),
          overflow: 'hidden',
        }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
              Elige la ruta de entrega
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Desde “Listo”, el pedido puede cerrarse por entrega directa o pasar a transportista.
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 72px 1fr',
              },
              gap: {
                xs: 2,
                md: 0,
              },
              pt: {
                xs: 1,
                md: 4.5,
              },
            }}
          >
            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'block',
                },
                position: 'absolute',
                top: 0,
                left: '50%',
                width: 2,
                height: 28,
                bgcolor: alpha(theme.palette.text.primary, 0.12),
                transform: 'translateX(-50%)',
              }}
            />

            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'block',
                },
                position: 'absolute',
                top: 28,
                left: '27%',
                right: '27%',
                height: 2,
                bgcolor: alpha(theme.palette.text.primary, 0.12),
              }}
            />

            {actions.map((action, index) => {
              const selected = selectedAdvance === action.value;
              const color = getActionColor(theme, action.severity);

              return (
                <Box
                  key={action.value}
                  sx={{
                    gridColumn: {
                      xs: '1',
                      md: index === 0 ? '1' : '3',
                    },
                    position: 'relative',
                    pt: {
                      xs: 0,
                      md: 2.25,
                    },
                    pl: {
                      xs: 2.25,
                      md: 0,
                    },
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: {
                        xs: 'block',
                        md: 'none',
                      },
                      position: 'absolute',
                      left: 7,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      bgcolor: alpha(theme.palette.text.primary, 0.12),
                    }}
                  />

                  <Box
                    sx={{
                      display: {
                        xs: 'block',
                        md: 'none',
                      },
                      position: 'absolute',
                      left: 7,
                      top: 58,
                      width: 16,
                      height: 2,
                      bgcolor: alpha(theme.palette.text.primary, 0.12),
                    }}
                  />

                  <Box
                    sx={{
                      display: {
                        xs: 'none',
                        md: 'block',
                      },
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      width: 2,
                      height: 20,
                      bgcolor: alpha(theme.palette.text.primary, 0.12),
                      transform: 'translateX(-50%)',
                    }}
                  />

                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => onSelect?.(action.value)}
                    variant="outlined"
                    sx={{
                      width: {
                        xs: '100%',
                        sm: 360,
                        md: 340,
                      },
                      minHeight: {
                        xs: 132,
                        sm: 138,
                      },
                      borderRadius: 2.5,
                      px: 2,
                      py: 2,
                      textTransform: 'none',
                      borderWidth: selected ? 1.5 : 1,
                      borderColor: selected ? color : 'divider',
                      bgcolor: selected
                        ? alpha(color, 0.11)
                        : 'background.paper',
                      color: 'text.primary',
                      boxShadow: selected ? 2 : 0,
                      '&:hover': {
                        borderColor: color,
                        bgcolor: selected
                          ? alpha(color, 0.14)
                          : alpha(color, 0.06),
                        boxShadow: 2,
                      },
                      '&.Mui-disabled': {
                        opacity: 0.6,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        display: 'grid',
                        justifyItems: 'center',
                        textAlign: 'center',
                        gap: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 46,
                          height: 46,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          color,
                          bgcolor: alpha(color, selected ? 0.18 : 0.1),
                          border: '1px solid',
                          borderColor: alpha(color, selected ? 0.28 : 0.16),
                        }}
                      >
                        {action.icon}
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 0.75,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 900,
                              color: 'text.primary',
                            }}
                          >
                            {action.title}
                          </Typography>

                          {selected && (
                            <Chip
                              size="small"
                              label="Seleccionado"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                color,
                                bgcolor: alpha(color, 0.1),
                                border: '1px solid',
                                borderColor: alpha(color, 0.24),
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.45,
                            color: 'text.secondary',
                            lineHeight: 1.3,
                          }}
                        >
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Button>
                </Box>
              );
            })}
          </Box>
        </Stack>
      </Paper>
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
  const selectedAdvance = form?.avanceNuevo || '';
  const selectedShippingStatus = getAdvanceStatus(selectedAdvance);

  const showShippingFields = isShippingAdvance(selectedAdvance);
  const mustCompleteTransport = requiresTransportData(selectedAdvance);
  const mustCompleteTrackingNumber =
    TRACKING_NUMBER_REQUIRED_STATUSES.includes(selectedShippingStatus);
  const mustCompleteIncidentComment = selectedShippingStatus === 'incidencia';

  const paymentStatus = order?.estado_pago || form?.estadoPago || '';
  const paymentApproved = APPROVED_PAYMENT_STATES.includes(paymentStatus);

  const deliveryMode = getDeliveryMode(order || {});

  const actions = getAvailableActions({
    order: order || {},
    deliveryMode,
    paymentApproved,
  });

  const normalActions = actions.filter((action) => action.value !== 'envio:incidencia');
  const incidentAction =
    actions.find((action) => action.value === 'envio:incidencia') || null;

  const isDeliveryBranchMode =
    deliveryMode === 'por_definir' &&
    ((order || {})?.estado_pedido === 'listo_para_envio' ||
      form?.estadoActual === 'listo_para_envio');

  const branchActions = isDeliveryBranchMode ? normalActions : [];
  const stepperActions = isDeliveryBranchMode ? [] : normalActions;

  const selectedAction = getSelectedAction(actions, selectedAdvance);

  const flowSteps = buildSelectableFlowSteps({
    order: order || {},
    deliveryMode,
    paymentApproved,
    actions: stepperActions,
  });

  const currentStepKey = getCurrentFlowStepKey({
    order: order || {},
    paymentApproved,
  });

  const currentStepIndex = getStepIndexByKey(flowSteps, currentStepKey);

  const isSaveDisabled =
    loading ||
    !selectedAction ||
    !paymentApproved ||
    (mustCompleteTransport && !form?.transportistaId) ||
    (mustCompleteTrackingNumber && !form?.numeroSeguimiento?.trim()) ||
    (mustCompleteIncidentComment && !form?.comentario?.trim());

  const handleSelectAdvance = (value) => {
    if (loading) return;
    onChange?.('avanceNuevo', value);
  };

  const handleSelectIncident = () => {
    if (loading) return;
    onChange?.('avanceNuevo', 'envio:incidencia');
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            width: {
              xs: 'calc(100% - 16px)',
              sm: 760,
              md: 900,
            },
            maxWidth: 'calc(100% - 24px)',
            height: {
              xs: 'calc(100dvh - 16px)',
              sm: 'auto',
            },
            maxHeight: {
              xs: 'calc(100dvh - 16px)',
              sm: 'calc(100dvh - 48px)',
            },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <DialogTitle
          sx={{
            pr: 6,
            pb: 1.5,
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={0.35}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Actualizar avance del pedido
            </Typography>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={loading}
            size="small"
            aria-label="Cerrar"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers={false}
          sx={{
            px: {
              xs: 1.5,
              sm: 2,
            },
            py: 2,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Stack spacing={2.25}>
            <ErrorMessage message={error} />

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'background.default',
              }}
            >
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Pedido
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {form?.numeroPedido || order?.numero_pedido || '-'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Estado pedido
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {getOrderStatusLabel(form?.estadoActual || order?.estado_pedido)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Estado envío
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900 }}>
                    {getShippingStatusLabel(
                      order?.estado_envio || form?.estadoEnvioActual || 'pendiente'
                    )}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    Pago
                  </Typography>
                  <Box sx={{ mt: 0.35 }}>
                    <Chip
                      size="small"
                      color={paymentApproved ? 'success' : 'warning'}
                      variant="outlined"
                      label={getPaymentStatusLabel(paymentStatus)}
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: {
                  xs: 2,
                  sm: 2.5,
                  md: 3,
                },
                borderRadius: 2.5,
                overflow: 'visible',
              }}
            >
              <Stack spacing={1.75}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: {
                      xs: 'column',
                      sm: 'row',
                    },
                    gap: 1,
                    alignItems: {
                      xs: 'flex-start',
                      sm: 'center',
                    },
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      Flujo general
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getDeliveryLabel(deliveryMode)}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    color={paymentApproved ? 'success' : 'warning'}
                    variant="outlined"
                    label={paymentApproved ? 'Pago aprobado' : 'Pago pendiente'}
                    sx={{ fontWeight: 800 }}
                  />
                </Box>

                <SelectableGeneralFlowStepper
                  steps={flowSteps}
                  currentStepIndex={currentStepIndex}
                  selectedAdvance={selectedAdvance}
                  loading={loading || !paymentApproved}
                  onSelect={handleSelectAdvance}
                />

                {paymentApproved && branchActions.length > 0 && (
                  <DeliveryFlowBranchDiagram
                    actions={branchActions}
                    selectedAdvance={selectedAdvance}
                    loading={loading}
                    onSelect={handleSelectAdvance}
                  />
                )}

                {!paymentApproved && (
                  <Alert severity="warning" variant="outlined">
                    Este pedido aún no tiene pago aprobado. La preparación y el despacho
                    se habilitan desde Pagos y comprobantes cuando el pago esté validado.
                  </Alert>
                )}

                {paymentApproved && normalActions.length === 0 && !incidentAction && (
                  <Alert severity="info" variant="outlined">
                    No hay acciones de avance disponibles para el estado actual del pedido.
                  </Alert>
                )}

                {selectedAction && selectedAdvance !== 'envio:incidencia' && (
                  <Alert severity="success" variant="outlined">
                    Seleccionaste: <strong>{selectedAction.title}</strong>.{' '}
                    {selectedAction.description}
                  </Alert>
                )}

                {incidentAction && (
                  <Alert
                    severity={selectedAdvance === 'envio:incidencia' ? 'warning' : 'info'}
                    variant="outlined"
                    action={
                      <Button
                        color="warning"
                        size="small"
                        variant={
                          selectedAdvance === 'envio:incidencia'
                            ? 'contained'
                            : 'outlined'
                        }
                        onClick={handleSelectIncident}
                        disabled={loading}
                        startIcon={<WarningAmberRoundedIcon />}
                      >
                        Registrar incidencia
                      </Button>
                    }
                  >
                    {selectedAdvance === 'envio:incidencia'
                      ? 'Incidencia seleccionada. Describe el problema en el comentario antes de guardar.'
                      : 'Si el envío tiene un problema, registra una incidencia en lugar de avanzar el flujo normal.'}
                  </Alert>
                )}

                {selectedAdvance === 'envio:incidencia' && (
                  <Alert severity="warning" variant="outlined">
                    Describe la incidencia en el comentario. Esta acción no avanza el flujo normal.
                  </Alert>
                )}
              </Stack>
            </Paper>

            {showShippingFields && selectedAdvance !== 'envio:incidencia' && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                }}
              >
                <Stack spacing={1.75}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      Datos de transporte
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Completa los datos disponibles para que el cliente pueda hacer
                      seguimiento del paquete.
                    </Typography>
                  </Box>

                  <CarrierTrackingFields
                    form={form}
                    loading={loading}
                    required={mustCompleteTransport}
                    requiredTrackingNumber={mustCompleteTrackingNumber}
                    showRequiredError={mustCompleteTransport && !form?.transportistaId}
                    showTrackingNumberError={
                      mustCompleteTrackingNumber && !form?.numeroSeguimiento?.trim()
                    }
                    onChange={onChange}
                  />
                </Stack>
              </Paper>
            )}

            <TextField
              multiline
              minRows={3}
              required={mustCompleteIncidentComment}
              label={
                mustCompleteIncidentComment
                  ? 'Comentario de incidencia'
                  : showShippingFields
                    ? 'Comentario de envío'
                    : 'Comentario interno'
              }
              placeholder={
                mustCompleteIncidentComment
                  ? 'Describe brevemente qué ocurrió con el envío.'
                  : showShippingFields
                    ? 'Puede ingresar un comentario sobre el envío.'
                    : 'Puede ingresar un comentario para el historial del pedido.'
              }
              value={form?.comentario || ''}
              disabled={loading}
              onChange={(event) => onChange?.('comentario', event.target.value)}
              error={mustCompleteIncidentComment && !form?.comentario?.trim()}
              helperText={
                mustCompleteIncidentComment && !form?.comentario?.trim()
                  ? 'El comentario es obligatorio cuando registras una incidencia.'
                  : undefined
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: {
              xs: 2,
              sm: 3,
            },
            py: 2,
            gap: 1,
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: {
              xs: 'column-reverse',
              sm: 'row',
            },
            '& > button': {
              width: {
                xs: '100%',
                sm: 'auto',
              },
            },
          }}
        >
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>

          <Button type="submit" variant="contained" disabled={isSaveDisabled}>
            {loading ? 'Guardando...' : selectedAction?.title || 'Guardar avance'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};