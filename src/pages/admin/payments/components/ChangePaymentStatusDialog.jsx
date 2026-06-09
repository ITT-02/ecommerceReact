import { isValidElement, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';

const APPROVED_STATES = ['aprobado', 'pagado'];
const PENDING_STATES = ['pendiente', 'validando', 'en_validacion'];
const REJECTED_STATES = ['rechazado'];
const EXPIRED_STATES = ['vencido', 'cancelado'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(amount || 0));

const getStatusLabel = (estado = '') => {
  const labels = {
    pendiente: 'Pendiente',
    validando: 'En validación',
    en_validacion: 'En validación',
    aprobado: 'Aprobado',
    pagado: 'Pagado',
    rechazado: 'Rechazado',
    vencido: 'Vencido',
    cancelado: 'Cancelado',
    reembolso_pendiente: 'Reembolso pendiente',
    reembolsado: 'Reembolsado',
  };
  return labels[estado] || estado || '-';
};

const getStatusColor = (estado = '') => {
  if (APPROVED_STATES.includes(estado)) return 'success';
  if (REJECTED_STATES.includes(estado) || EXPIRED_STATES.includes(estado)) return 'error';
  if (estado === 'reembolsado') return 'info';
  return 'warning';
};

const getReceiptUrl = (pago = {}) =>
  pago.url_comprobante ||
  pago.comprobante_url ||
  pago.archivo_comprobante_url ||
  pago.voucher_url ||
  '';

const buildAction = ({ value, title, description, color = 'primary', Icon, requiresComment = false }) => ({
  value, title, description, color, Icon, requiresComment,
});

const getAllowedActions = (estadoActual = '') => {
  if (PENDING_STATES.includes(estadoActual)) {
    return [
      buildAction({ value: 'aprobado', title: 'Aprobar', description: 'Confirma el pago y habilita la atención del pedido.', color: 'success', Icon: CheckCircleOutlineRoundedIcon }),
      buildAction({ value: 'rechazado', title: 'Rechazar', description: 'El cliente deberá corregir o reenviar el comprobante.', color: 'error', Icon: ErrorOutlineRoundedIcon, requiresComment: true }),
      buildAction({ value: 'vencido', title: 'Marcar vencido', description: 'Cierra el intento cuando ya no corresponde validarlo.', color: 'warning', Icon: HourglassBottomRoundedIcon, requiresComment: true }),
    ];
  }

  if (APPROVED_STATES.includes(estadoActual)) {
    return [
      buildAction({ value: 'pendiente', title: 'Enviar a revisión', description: 'Solo si el pago aprobado requiere revisión administrativa.', color: 'warning', Icon: RefreshRoundedIcon, requiresComment: true }),
    ];
  }

  if (REJECTED_STATES.includes(estadoActual) || EXPIRED_STATES.includes(estadoActual)) {
    return [
      buildAction({ value: 'pendiente', title: 'Reabrir revisión', description: 'Permite revisar nuevamente si el cliente envió información corregida.', color: 'warning', Icon: RefreshRoundedIcon, requiresComment: true }),
    ];
  }

  return [];
};

const ActionCard = ({ action, selected, disabled, onSelect }) => {
  const theme = useTheme();
  const palette = theme.palette[action.color] || theme.palette.primary;
  const Icon = action.Icon;

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: selected ? palette.main : 'divider',
        bgcolor: selected ? alpha(palette.main, 0.08) : 'background.paper',
        boxShadow: selected ? 2 : 0,
      }}
    >
      <CardActionArea disabled={disabled} onClick={onSelect} sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={1}>
            <Box sx={{ color: palette.main, display: 'flex' }}>
              <Icon />
            </Box>
            <Typography variant="subtitle2" fontWeight={900}>{action.title}</Typography>
            <Typography variant="body2" color="text.secondary">{action.description}</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const SummaryItem = ({ label, value }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary" fontWeight={800}>{label}</Typography>
    {isValidElement(value) ? (
      <Box>{value}</Box>
    ) : (
      <Typography variant="body2" fontWeight={700}>{value || '-'}</Typography>
    )}
  </Stack>
);

export const ChangePaymentStatusDialog = ({ open, pago, isUpdating, onClose, onConfirm }) => {
  const theme = useTheme();
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [errorDesc, setErrorDesc] = useState('');

  useEffect(() => {
    if (open && pago) {
      setNuevoEstado('');
      setComentario('');
      setErrorDesc('');
    }
  }, [open, pago]);

  const actions = useMemo(() => getAllowedActions(pago?.estado), [pago?.estado]);
  const selectedAction = actions.find((action) => action.value === nuevoEstado) || null;
  const receiptUrl = getReceiptUrl(pago || {});

  if (!pago) return null;

  const handleSubmit = async () => {
    if (!nuevoEstado) {
      setErrorDesc('Selecciona una acción para el pago.');
      return;
    }

    if (nuevoEstado === pago.estado) {
      setErrorDesc('El pago ya se encuentra en ese estado.');
      return;
    }

    if (selectedAction?.requiresComment && !comentario.trim()) {
      setErrorDesc('Ingresa el motivo para registrar esta acción.');
      return;
    }

    try {
      await onConfirm({
        pagoId: pago.id,
        estadoNuevo: nuevoEstado,
        comentario: comentario.trim(),
      });
      onClose();
    } catch (error) {
      setErrorDesc(error.response?.data?.message || error.message || 'No se pudo actualizar el estado del pago.');
    }
  };

  const canConfirm = !!nuevoEstado && !(selectedAction?.requiresComment && !comentario.trim());

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Cambiar estado"
      icon={<SwapHorizRoundedIcon />}
      maxWidth="sm"
      loading={isUpdating}
      disableBackdropClick={isUpdating}
      actions={
        <>
          <Button onClick={onClose} disabled={isUpdating} variant="outlined" color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isUpdating || !canConfirm}
          >
            {isUpdating ? 'Guardando...' : selectedAction?.title || 'Confirmar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <Card
          variant="outlined"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            borderColor: alpha(theme.palette.primary.main, 0.16),
          }}
        >
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SummaryItem label="N° pedido" value={pago.numero_pedido} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SummaryItem
                  label="Estado actual"
                  value={<Chip size="small" color={getStatusColor(pago.estado)} variant="outlined" label={getStatusLabel(pago.estado)} />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SummaryItem label="Cliente" value={pago.nombre_cliente} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SummaryItem label="Monto" value={formatCurrency(pago.monto)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SummaryItem label="Método" value={pago.metodo_pago} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SummaryItem label="Referencia" value={pago.referencia_transaccion} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {receiptUrl && (
          <Alert severity="info">
            Comprobante: <Link href={receiptUrl} target="_blank" rel="noreferrer">abrir</Link>
          </Alert>
        )}

        {errorDesc && <Alert severity="error">{errorDesc}</Alert>}

        <Typography variant="subtitle1" fontWeight={900}>Acción</Typography>

        {actions.length === 0 ? (
          <Alert severity="info">Sin acciones disponibles para el estado actual.</Alert>
        ) : (
          <Grid container spacing={1.5}>
            {actions.map((action) => (
              <Grid key={action.value} size={{ xs: 12, sm: actions.length === 1 ? 12 : 6 }}>
                <ActionCard
                  action={action}
                  selected={nuevoEstado === action.value}
                  disabled={isUpdating}
                  onSelect={() => {
                    setNuevoEstado(action.value);
                    setErrorDesc('');
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}

        <Divider />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label={selectedAction?.requiresComment ? 'Motivo' : 'Comentario'}
          value={comentario}
          onChange={(event) => setComentario(event.target.value)}
          disabled={isUpdating}
          required={Boolean(selectedAction?.requiresComment)}
        />
      </Stack>
    </AdminDialog>
  );
};
