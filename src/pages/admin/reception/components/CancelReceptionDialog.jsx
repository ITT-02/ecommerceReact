import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';

import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { formatDate } from '../../../../utils/formatters';

/**
 * Diálogo para anular una recepción completa.
 *
 * Regla funcional:
 * - No se anula directamente el movimiento de inventario generado por recepción.
 * - La anulación debe pasar por este flujo para revertir stock, orden de compra,
 *   cantidades recibidas y costo promedio de forma consistente.
 */
export const CancelReceptionDialog = ({ open, reception, loading, error, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [localError, setLocalError] = useState('');

  const handleClose = () => {
    if (loading) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setReason('');
    setLocalError('');
    onClose?.();
  };

  const handleConfirm = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setLocalError('Ingresa el motivo de anulación para dejar trazabilidad.');
      return;
    }

    await onConfirm?.({ receptionId: reception.id, motivoAnulacion: trimmedReason });
    setReason('');
    setLocalError('');
  };

  if (!reception) return null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" disableRestoreFocus>
      <DialogTitle sx={{ pr: 6, fontWeight: 900 }}>
        Anular recepción
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          aria-label="Cerrar"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="warning" icon={<ReportProblemRoundedIcon fontSize="inherit" />}>
            Esta acción revertirá el ingreso de inventario generado por la recepción, actualizará la orden de compra y recalculará el costo promedio.
          </Alert>

          <Stack
            spacing={0.5}
            sx={(theme) => ({
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Typography variant="body2" fontWeight={900}>
              {reception.codigo_recepcion}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Orden: {reception.numero_orden || 'Manual'} · Proveedor: {reception.proveedor_nombre || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fecha: {formatDate(reception.created_at)}
            </Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Solo se podrá anular si todavía existe stock disponible suficiente en el almacén donde ingresó la mercadería. Si parte del stock ya fue vendido o reservado, primero revisa esos movimientos.
          </Typography>

          <ErrorMessage message={localError || error} />

          <TextField
            required
            multiline
            minRows={3}
            label="Motivo de anulación"
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (localError) setLocalError('');
            }}
            placeholder="Ingrese motivo de anulacion."
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" color="error" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Anulando...' : 'Confirmar anulación'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
