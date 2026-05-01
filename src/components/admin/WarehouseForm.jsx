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
import { TextFieldController } from '../forms/TextFieldController';
import { FormActions } from '../forms/FormActions';
import { colors } from '../../styles/theme';

export const WarehouseForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre?.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    setError('');
    setLoading(true);
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
      setLoading(false);
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
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', backgroundColor: colors.neutral[50], borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, color: colors.primary[700] }}>
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
                sx={{ color: colors.primary[500], '&.Mui-checked': { color: colors.primary[600] } }}
              />
            }
            label="Activo"
          />
        </Stack>
        <FormActions
          editing={isEditing}
          loading={loading}
          onCancel={onCancel}
        />
      </form>
    </Paper>
  );
};