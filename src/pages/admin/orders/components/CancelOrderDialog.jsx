import { Alert, Button, Stack, TextField } from '@mui/material';

import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { preventButtonFocus } from '../utils/dialogFocusUtils';
import { OrderDialogShell } from './OrderDialogShell';
import { OrderSummaryPanel } from './OrderSummaryPanel';

export const CancelOrderDialog = ({ open, form, error, loading, onChange, onClose, onSubmit }) => {
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
      title="Cancelar pedido"
      subtitle="Registra el motivo para dejar trazabilidad del cambio."
      actions={
        <>
          <Button variant="outlined" onMouseDown={preventButtonFocus} onClick={onClose} disabled={loading}>
            Volver
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            onMouseDown={preventButtonFocus}
            disabled={loading || !form.motivo.trim()}
          >
            Cancelar pedido
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />

        <Alert severity="warning" variant="outlined">
          Si el pedido está pagado, no se elimina el pago: quedará como reembolso pendiente.
        </Alert>

        <OrderSummaryPanel
          defaultSize={{ xs: 12 }}
          items={[{ label: 'N° pedido', value: form.numeroPedido }]}
        />

        <TextField
          required
          multiline
          minRows={3}
          label="Motivo de cancelación"
          value={form.motivo}
          disabled={loading}
          onChange={(event) => updateField('motivo', event.target.value)}
        />

        <TextField
          multiline
          minRows={2}
          label="Comentario interno opcional"
          value={form.comentario}
          disabled={loading}
          onChange={(event) => updateField('comentario', event.target.value)}
        />
      </Stack>
    </OrderDialogShell>
  );
};
