import { Alert, Button, Stack, TextField } from '@mui/material';

import { AppDatePicker } from '../../../../components/common/AppDatePicker';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { preventButtonFocus } from '../utils/dialogFocusUtils';
import { OrderDialogShell } from './OrderDialogShell';
import { OrderSummaryPanel } from './OrderSummaryPanel';

export const ReopenOrderDialog = ({ open, form, error, loading, onChange, onClose, onSubmit }) => {
  const updateField = (name, value) => {
    onChange((current) => ({ ...current, [name]: value }));
  };

  return (
    <OrderDialogShell
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      loading={loading}
      maxWidth="sm"
      title="Reabrir pedido"
      subtitle="Usa esta acción cuando el pedido cancelado debe volver al flujo comercial."
      actions={
        <>
          <Button variant="outlined" onMouseDown={preventButtonFocus} onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            onMouseDown={preventButtonFocus}
            disabled={loading || !form.motivo.trim()}
          >
            Reabrir pedido
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />

        <Alert severity="info" variant="outlined">
          Si el pedido no estaba pagado, puedes asignar una nueva fecha límite de pago.
          Si estaba pagado y no fue reembolsado, volverá como confirmado.
        </Alert>

        <OrderSummaryPanel
          defaultSize={{ xs: 12 }}
          items={[{ label: 'N° pedido', value: form.numeroPedido }]}
        />

        <TextField
          required
          multiline
          minRows={3}
          label="Motivo de reapertura"
          value={form.motivo}
          disabled={loading}
          onChange={(event) => updateField('motivo', event.target.value)}
        />

        <AppDatePicker
          label="Nueva fecha límite de pago"
          value={form.nuevaFechaLimitePago}
          onChange={(value) => updateField('nuevaFechaLimitePago', value)}
          disabled={loading}
          helperText="Aplica al volver a pendiente de pago."
          width="100%"
        />
      </Stack>
    </OrderDialogShell>
  );
};
