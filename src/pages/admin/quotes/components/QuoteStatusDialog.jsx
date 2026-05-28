import { useEffect, useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

export const QuoteStatusDialog = ({ open, quote, loading = false, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ estadoNuevo: 'en_revision', comentario: '' });

  useEffect(() => {
    if (!open) return;
    setFormData({ estadoNuevo: 'en_revision', comentario: '' });
  }, [open]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({ cotizacionId: quote?.id, ...formData });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Cambiar estado</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" id="quote-status-form" spacing={2} onSubmit={handleSubmit}>
          <TextField
            select
            label="Nuevo estado"
            value={formData.estadoNuevo}
            onChange={(event) => setFormData((current) => ({ ...current, estadoNuevo: event.target.value }))}
            fullWidth
            required
          >
            <MenuItem value="en_revision">En revisión</MenuItem>
            <MenuItem value="rechazada">Rechazada</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
            <MenuItem value="vencida">Vencida</MenuItem>
          </TextField>

          <TextField
            label="Comentario"
            value={formData.comentario}
            onChange={(event) => setFormData((current) => ({ ...current, comentario: event.target.value }))}
            multiline
            minRows={3}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button type="submit" form="quote-status-form" variant="contained" disabled={loading}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
