// Formulario para crear y editar almacenes.

import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TextFieldController } from '../forms/TextFieldController';
import { FormActions } from '../forms/FormActions';


export const WarehouseForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
  loading: externalLoading = false,
}) => {
  const theme = useTheme();
  const [error, setError] = React.useState('');
  const [localLoading, setLocalLoading] = React.useState(false);
  const effectiveLoading = externalLoading || localLoading;


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setError('');
    setLocalLoading(true);
    const dataToSubmit = {
      ...formData,
      descripcion: formData.descripcion?.trim() || null,
    };
    try {
      await onSubmit(dataToSubmit);
    } catch (err) {
      setError(err?.message || 'Error al guardar');
      console.error('Error en formulario:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
  };

  const handleCheckboxChange = (e) => {
    setFormData({
      ...formData,
      es_activo: e.target.checked,
    });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
        {isEditing ? 'Editar almacén' : 'Agregar almacén'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextFieldController
            name="nombre"
            label="Nombre"
            value={formData.nombre || ''}
            onChange={handleChange('nombre')}
            required
            fullWidth
          />
          <TextFieldController
            name="descripcion"
            label="Descripción"
            value={formData.descripcion || ''}
            onChange={handleChange('descripcion')}
            multiline
            rows={3}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.es_activo || false}
                onChange={handleCheckboxChange}
              />
            }
            label="Activo"
          />
        </Stack>

        <FormActions
          editing={isEditing}
          loading={effectiveLoading}
          onCancel={onCancel}
        />
      </form>
    </Paper>
  );
};