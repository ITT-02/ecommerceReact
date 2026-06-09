// Diálogo administrativo para registrar o actualizar el seguimiento de envío.
// El Stepper funciona como selector principal del siguiente estado.

import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
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
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { AdminDialog } from '../../common/adminDialog/AdminDialog';

import {
  SHIPPING_REQUIRED_ADVANCE_VALUES,
  SHIPPING_STATUS_COLOR,
  getShippingStatusLabel,
} from '../../../adapters/orderAdapter';
import { ErrorMessage } from '../../common/ErrorMessage';
import { CarrierTrackingFields } from './CarrierTrackingFields';

const TRACKING_NUMBER_REQUIRED_STATUSES = ['en_transito', 'en_destino', 'entregado'];

const SHIPPING_FLOW = [
  {
    value: 'pendiente',
    label: 'Pendiente',
    actionLabel: 'Pendiente',
    description: 'El envío no fue entregado al transportista.',
  },
  {
    value: 'entregado_repartidora',
    label: 'Transportista',
    actionLabel: 'Entregado a transportista',
    description: 'Se registra entrega a transportista.',
  },
  {
    value: 'en_transito',
    label: 'En tránsito',
    actionLabel: 'Marcar en tránsito',
    description: 'El paquete está en ruta.',
  },
  {
    value: 'en_destino',
    label: 'En destino',
    actionLabel: 'Marcar en destino',
    description: 'Llegó a la zona/agencia de destino.',
  },
  {
    value: 'entregado',
    label: 'Entregado',
    actionLabel: 'Entregado al cliente',
    description: 'El cliente recibió el paquete.',
  },
];

const getStepIndex = (status = 'pendiente') => {
  const index = SHIPPING_FLOW.findIndex((step) => step.value === status);
  return index >= 0 ? index : 0;
};

const getSelectableStepValues = (currentStatus = 'pendiente') => {
  if (currentStatus === 'entregado') return [];

  if (currentStatus === 'incidencia') {
    return ['en_transito', 'en_destino', 'entregado'];
  }

  if (!currentStatus || currentStatus === 'pendiente' || currentStatus === 'preparando') {
    return ['entregado_repartidora'];
  }

  if (currentStatus === 'entregado_repartidora') {
    return ['en_transito'];
  }

  if (currentStatus === 'en_transito') {
    return ['en_destino', 'entregado'];
  }

  if (currentStatus === 'en_destino') {
    return ['entregado'];
  }

  return [];
};

const canRegisterIncident = (currentStatus = 'pendiente') => {
  return !['entregado', 'incidencia'].includes(currentStatus);
};

const getSelectedAction = (selectedStatus = '') => {
  if (selectedStatus === 'incidencia') {
    return {
      value: 'incidencia',
      label: 'Registrar incidencia',
      actionLabel: 'Registrar incidencia',
      description: 'Problema en transporte o entrega.',
    };
  }

  return SHIPPING_FLOW.find((step) => step.value === selectedStatus) || null;
};

const getSaveButtonLabel = (selectedAction, loading) => {
  if (loading) return 'Guardando...';
  if (!selectedAction) return 'Guardar envío';

  return selectedAction.actionLabel || selectedAction.label || 'Guardar envío';
};

const StepStatusChip = ({ label, color = 'default', variant = 'outlined' }) => (
  <Chip
    size="small"
    label={label}
    color={color}
    variant={variant}
    sx={{
      height: 22,
      fontSize: '0.68rem',
      fontWeight: 800,
    }}
  />
);

const StepOptionalState = ({
  isCurrent,
  isSelected,
  isSelectable,
}) => {
  return (
    <Box
      sx={{
        mt: 0.75,
        display: 'grid',
        justifyItems: 'center',
        gap: 0.5,
        minHeight: 26,
      }}
    >
      {isCurrent && <StepStatusChip label="Actual" color="primary" variant="outlined" />}
      {isSelected && <StepStatusChip label="Seleccionado" color="success" variant="filled" />}
      {!isCurrent && !isSelected && isSelectable && (
        <StepStatusChip label="Elegir" color="default" variant="outlined" />
      )}
    </Box>
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
  const theme = useTheme();

  const currentStatus = order?.estado_envio || form?.estadoEnvioActual || 'pendiente';
  const selectedStatus = form?.estadoEnvio || '';

  const currentStepIndex = getStepIndex(currentStatus);
  const selectableStepValues = getSelectableStepValues(currentStatus);
  const selectedAction = getSelectedAction(selectedStatus);

  const mustCompleteTransport = SHIPPING_REQUIRED_ADVANCE_VALUES.includes(selectedStatus);
  const mustCompleteTrackingNumber = TRACKING_NUMBER_REQUIRED_STATUSES.includes(selectedStatus);
  const mustCompleteComment = selectedStatus === 'incidencia';

  const isSaveDisabled =
    loading ||
    !selectedAction ||
    (mustCompleteTransport && !form?.transportistaId) ||
    (mustCompleteTrackingNumber && !form?.numeroSeguimiento?.trim()) ||
    (mustCompleteComment && !form?.comentario?.trim());

  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange?.(name, value);
  };

  const handleSelectStep = (status) => {
    if (loading) return;
    onChange?.('estadoEnvio', status);
  };

  const handleSelectIncident = () => {
    if (loading) return;
    onChange?.('estadoEnvio', 'incidencia');
  };

  return (
    <AdminDialog
      open={open}
      onClose={loading ? undefined : onClose}
      title="Seguimiento"
      maxWidth="md"
      loading={loading}
      onSubmit={onSubmit}
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>

          <Button type="submit" variant="contained" disabled={isSaveDisabled}>
            {getSaveButtonLabel(selectedAction, loading)}
          </Button>
        </>
      }
      stickyActionsOnMobile={true}
      contentSx={{
        px: { xs: 1.5, sm: 0 },
        py: 0,
      }}
      icon={null}
      subtitle={null}
    >
      <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <Stack spacing={2.5}>
          <ErrorMessage message={error} />

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'background.default' }}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                  Pedido
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 900 }}>
                  {order?.numero_pedido || form?.numeroPedido || '-'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                  Estado
                </Typography>
                <Box sx={{ mt: 0.35 }}>
                  <Chip
                    size="small"
                    label={getShippingStatusLabel(currentStatus)}
                    color={SHIPPING_STATUS_COLOR[currentStatus] || 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {currentStatus === 'incidencia' && (
            <Alert severity="warning" variant="outlined">
              Hay una incidencia activa en este envío.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, overflow: 'visible' }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                  Estado siguiente
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Solo los pasos permitidos están habilitados.
                </Typography>
              </Box>

              {selectableStepValues.length === 0 ? (
                <Alert severity="info" variant="outlined">
                  No hay estados disponibles para actualizar este envío.
                </Alert>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    minHeight: 150,
                    overflowX: 'auto',
                    overflowY: 'visible',
                    pt: 3,
                    pb: 2.5,
                  }}
                >
                  <Stepper
                    nonLinear
                    alternativeLabel
                    activeStep={currentStepIndex}
                    sx={{
                      minWidth: { xs: 760, md: 900 },
                      px: 1.5,
                      py: 1,
                      '& .MuiStepLabel-label': {
                        typography: 'caption',
                        fontWeight: 800,
                        mt: 0.75,
                        whiteSpace: 'nowrap',
                      },
                      '& .MuiStepIcon-root.Mui-active': { color: 'primary.main' },
                      '& .MuiStepIcon-root.Mui-completed': { color: 'success.main' },
                      '& .MuiStepConnector-line': { borderColor: 'divider' },
                    }}
                  >
                    {SHIPPING_FLOW.map((step, index) => {
                      const isCurrent = step.value === currentStatus;
                      const isSelected = step.value === selectedStatus;
                      const isCompleted = index < currentStepIndex;
                      const isSelectable = selectableStepValues.includes(step.value);
                      const isDisabled = !isSelectable || loading;

                      return (
                        <Step key={step.value} completed={isCompleted}>
                          <StepButton
                            disabled={isDisabled}
                            onClick={() => handleSelectStep(step.value)}
                            optional={
                              <StepOptionalState
                                isCurrent={isCurrent}
                                isSelected={isSelected}
                                isSelectable={isSelectable}
                              />
                            }
                            sx={{
                              minHeight: 105,
                              borderRadius: 2,
                              px: 0.75,
                              py: 1,
                              border: '1px solid',
                              borderColor: isSelected
                                ? 'success.main'
                                : isCurrent
                                  ? 'primary.main'
                                  : 'transparent',
                              bgcolor: isSelected
                                ? alpha(theme.palette.success.main, 0.08)
                                : isCurrent
                                  ? alpha(theme.palette.primary.main, 0.06)
                                  : 'transparent',
                              '&:hover': {
                                bgcolor: isSelectable
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : 'transparent',
                              },
                              '&.Mui-disabled': {
                                opacity: isCompleted || isCurrent ? 1 : 0.42,
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
              )}

              {selectedAction && selectedStatus !== 'incidencia' && (
                <Alert severity="success" variant="outlined">
                  {selectedAction.description}
                </Alert>
              )}

              {canRegisterIncident(currentStatus) && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 0.5 }}>
                  <Button
                    variant={selectedStatus === 'incidencia' ? 'contained' : 'outlined'}
                    color="warning"
                    startIcon={<WarningAmberRoundedIcon />}
                    onClick={handleSelectIncident}
                    disabled={loading}
                  >
                    Incidencia
                  </Button>
                </Box>
              )}

              {selectedStatus === 'incidencia' && (
                <Alert severity="warning" variant="outlined">
                  Registra el problema en el comentario antes de guardar.
                </Alert>
              )}
            </Stack>
          </Paper>

          {selectedStatus && selectedStatus !== 'incidencia' && (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Stack spacing={1.75}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                    Datos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Transportista, código, enlace y estado.
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
            name="comentario"
            label={mustCompleteComment ? 'Comentario de incidencia' : 'Comentario'}
            placeholder={mustCompleteComment ? 'Describe el problema.' : 'Opcional'}
            value={form?.comentario || ''}
            onChange={handleChange}
            required={mustCompleteComment}
            disabled={loading}
            multiline
            minRows={3}
            error={mustCompleteComment && !form?.comentario?.trim()}
            helperText={mustCompleteComment && !form?.comentario?.trim() ? 'Obligatorio en incidencia.' : undefined}
          />
        </Stack>
      </Box>
    </AdminDialog>
  );
};

