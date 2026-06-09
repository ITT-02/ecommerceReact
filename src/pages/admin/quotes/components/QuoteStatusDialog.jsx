import { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';

/**
 * QuoteStatusDialog — usa AdminDialog (no ConfirmDialog) porque
 * pide campo de comentario,
 * "Si pide comentario o motivo: usar AdminDialog."
 */
export const QuoteStatusDialog = ({ open, quote, loading = false, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ estadoNuevo: 'en_revision', comentario: '' });

  useEffect(() => {
    if (!open) return;
    setFormData({ estadoNuevo: 'en_revision', comentario: '' });
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ cotizacionId: quote?.id, ...formData });
  };

  const actions = (
    <>
      <Button onClick={onClose} disabled={loading} color="inherit">
        Cancelar
      </Button>
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {loading ? 'Guardando…' : 'Guardar'}
      </Button>
    </>
  );

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      title="Cambiar estado"
      icon={<AssignmentTurnedInOutlinedIcon />}
      maxWidth="sm"
      loading={loading}
      actions={actions}
      onSubmit={handleSubmit}
    >
      <Stack spacing={2}>

        <TextField
          select
          label="Nuevo estado"
          value={formData.estadoNuevo}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, estadoNuevo: e.target.value }))
          }
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
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comentario: e.target.value }))
          }
          multiline
          minRows={3}
          fullWidth
        />
      </Stack>
    </AdminDialog>
  );
};