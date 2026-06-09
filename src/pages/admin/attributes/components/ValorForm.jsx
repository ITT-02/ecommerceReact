import { useEffect, useState } from 'react';
import {
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Stack,
  Box,
  Typography,
} from '@mui/material';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';

import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';

export const ValorForm = ({ open, isEdit, valorInicial, tipoDatoPadre, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    valor: '',
    orden_visual: 0,
    es_activo: true,
    color_hex: '#000000',
  });

  const isColor = tipoDatoPadre === 'color';

  useEffect(() => {
    if (open && valorInicial) {
      setFormData({
        valor: valorInicial.valor || '',
        orden_visual: valorInicial.orden_visual ?? 0,
        es_activo: valorInicial.es_activo ?? true,
        color_hex: valorInicial.color_hex || '#000000',
      });
    } else if (open) {
      setFormData({ valor: '', orden_visual: 0, es_activo: true, color_hex: '#000000' });
    }
  }, [open, valorInicial]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    const processValue = type === 'checkbox'
      ? checked
      : type === 'number'
        ? Math.max(0, Number(value))
        : value;

    setFormData((prev) => ({ ...prev, [name]: processValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      valor: formData.valor,
      orden_visual: formData.orden_visual,
      es_activo: formData.es_activo,
      color_hex: isColor ? formData.color_hex : null,
    });
  };

  return (
    <AdminDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEdit ? 'Editar valor' : 'Nuevo valor'}
      icon={<FormatListBulletedOutlinedIcon />}
      maxWidth="xs"
      actions={
        <>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            Guardar
          </Button>
        </>
      }
    >
      <Stack spacing={3}>
        <TextField
          label="Valor"
          name="valor"
          value={formData.valor}
          onChange={handleChange}
          fullWidth
          required
        />
        {isColor && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input
              type="color"
              name="color_hex"
              value={formData.color_hex}
              onChange={handleChange}
              style={{ width: 56, height: 56, padding: 0, cursor: 'pointer' }}
            />
            <TextField
              label="Color hexadecimal"
              name="color_hex"
              value={formData.color_hex}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        )}
        <TextField
          type="number"
          label="Orden visual"
          name="orden_visual"
          value={formData.orden_visual}
          onChange={handleChange}
          fullWidth
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <FormControlLabel
          control={<Switch color="success" name="es_activo" checked={formData.es_activo} onChange={handleChange} />}
          label={<Typography sx={{ fontWeight: 500 }}>Activo</Typography>}
        />
      </Stack>
    </AdminDialog>
  );
};
