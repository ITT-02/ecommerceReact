import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { ErrorMessage } from '../../../../components/common/ErrorMessage';

const initialForm = {
  id: '',
  ruc: '',
  razon_social: '',
  nombre_comercial: '',
  contacto: '',
  telefono: '',
  correo: '',
  direccion: '',
  notas: '',
  es_activo: true,
};

export const SupplierDialog = ({ open, supplier, saving, error, onClose, onSubmit }) => {
  const [form, setForm] = useState(() => ({ ...initialForm, ...(supplier || {}) }));

  /**
   * Reiniciamos el formulario cada vez que se abre el diálogo para evitar
   *  que queden datos pegados de un proveedor anterior.
   */
  useEffect(() => {
    if (open) {
      setForm({
        ...initialForm,
        ...(supplier || {}),
        es_activo: supplier?.es_activo ?? true,
      });
    }
  }, [open, supplier]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit?.({
      ...form,
      razon_social: form.razon_social.trim(),
      ruc: form.ruc?.trim() || null,
      nombre_comercial: form.nombre_comercial?.trim() || null,
      contacto: form.contacto?.trim() || null,
      telefono: form.telefono?.trim() || null,
      correo: form.correo?.trim() || null,
      direccion: form.direccion?.trim() || null,
      notas: form.notas?.trim() || null,
      es_activo: Boolean(form.es_activo),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            pr: 6,
            fontWeight: 900,
            color: 'text.primary',
          }}
        >
          {form.id ? 'Editar proveedor' : 'Nuevo proveedor'}

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
            aria-label="Cerrar"
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <ErrorMessage message={error} />

            <TextField
              label="RUC"
              value={form.ruc || ''}
              onChange={(event) => updateField('ruc', event.target.value)}
            />

            <TextField
              required
              label="Razón social / Nombre"
              value={form.razon_social || ''}
              onChange={(event) => updateField('razon_social', event.target.value)}
            />

            <TextField
              label="Nombre comercial"
              value={form.nombre_comercial || ''}
              onChange={(event) => updateField('nombre_comercial', event.target.value)}
            />

            <TextField
              label="Contacto"
              value={form.contacto || ''}
              onChange={(event) => updateField('contacto', event.target.value)}
            />

            <TextField
              label="Teléfono"
              value={form.telefono || ''}
              onChange={(event) => updateField('telefono', event.target.value)}
            />

            <TextField
              label="Correo"
              type="email"
              value={form.correo || ''}
              onChange={(event) => updateField('correo', event.target.value)}
            />

            <TextField
              label="Dirección"
              value={form.direccion || ''}
              onChange={(event) => updateField('direccion', event.target.value)}
            />

            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                  }}
                >
                  Estado del proveedor
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {form.es_activo
                    ? 'Activo para compras, abastecimiento y recepción.'
                    : 'Inactivo temporalmente para nuevas operaciones.'}
                </Typography>
              </Box>

              <Switch
                checked={Boolean(form.es_activo)}
                onChange={(event) => updateField('es_activo', event.target.checked)}
                color="primary"
                slotProps={{
                  input: {
                    'aria-label': 'Cambiar estado del proveedor',
                  },
                }}
              />
            </Box>

            <TextField
              multiline
              minRows={3}
              label="Notas"
              value={form.notas || ''}
              onChange={(event) => updateField('notas', event.target.value)}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>

          <Button type="submit" variant="contained" disabled={saving || !form.razon_social?.trim()}>
            Guardar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};