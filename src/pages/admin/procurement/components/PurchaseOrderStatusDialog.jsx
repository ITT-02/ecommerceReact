import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { ErrorMessage } from '../../../../components/common/ErrorMessage';

const STATUS_OPTIONS = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviada', label: 'Enviada al proveedor' },
  { value: 'confirmada', label: 'Confirmada por proveedor' },
  { value: 'cancelada', label: 'Cancelada' },
];

export const PurchaseOrderStatusDialog = ({ open, order, saving, error, onClose, onSubmit }) => {
  const [estado, setEstado] = useState(() => (order?.estado === 'borrador' ? 'enviada' : order?.estado || 'enviada'));
  const [comentario, setComentario] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.({ purchaseOrderId: order.id, estado, comentario });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pr: 6, fontWeight: 900 }}>
          Cambiar estado de compra
          <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }} aria-label="Cerrar">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">Orden</Typography>
              <Typography variant="subtitle1" fontWeight={900}>{order?.numero_orden || '-'}</Typography>
            </Box>

            <ErrorMessage message={error} />

            <TextField select label="Nuevo estado" value={estado} onChange={(event) => setEstado(event.target.value)}>
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>

            <TextField
              multiline
              minRows={3}
              label="Comentario interno"
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving || !estado}>Guardar estado</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
