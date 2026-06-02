import { Alert, Button, Stack, TextField } from '@mui/material';

import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { formatCurrency } from '../utils/ordersPageUtils';
import { preventButtonFocus } from '../utils/dialogFocusUtils';
import { OrderDialogShell } from './OrderDialogShell';
import { OrderSummaryPanel } from './OrderSummaryPanel';

export const RefundOrderDialog = ({ open, form, error, loading, onChange, onClose, onSubmit }) => {
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
      title="Registrar reembolso"
      subtitle="Completa los datos del reembolso para cerrar correctamente el flujo financiero."
      actions={
        <>
          <Button variant="outlined" onMouseDown={preventButtonFocus} onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            onMouseDown={preventButtonFocus}
            disabled={loading || !form.metodoReembolso.trim() || !form.motivo.trim()}
          >
            Registrar reembolso
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />

        <Alert severity="info" variant="outlined">
          Verifica el monto y registra referencia u operación si está disponible.
        </Alert>

        <OrderSummaryPanel
          defaultSize={{ xs: 12, sm: 6 }}
          items={[
            { label: 'N° pedido', value: form.numeroPedido },
            { label: 'Monto sugerido', value: formatCurrency(form.monto) },
          ]}
        />

        <TextField
          required
          label="Monto"
          type="number"
          value={form.monto}
          disabled={loading}
          onChange={(event) => updateField('monto', event.target.value)}
          slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
        />

        <TextField
          required
          label="Método de reembolso"
          value={form.metodoReembolso}
          disabled={loading}
          onChange={(event) => updateField('metodoReembolso', event.target.value)}
          helperText="Ejemplo: Yape, Plin, transferencia, efectivo u otro método usado."
        />

        <TextField
          label="Referencia / operación"
          value={form.referenciaReembolso}
          disabled={loading}
          onChange={(event) => updateField('referenciaReembolso', event.target.value)}
        />

        <TextField
          required
          multiline
          minRows={3}
          label="Motivo"
          value={form.motivo}
          disabled={loading}
          onChange={(event) => updateField('motivo', event.target.value)}
        />
      </Stack>
    </OrderDialogShell>
  );
};
