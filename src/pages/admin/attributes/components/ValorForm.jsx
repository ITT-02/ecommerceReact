import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Stack,
  Box,
} from '@mui/material';

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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      valor: formData.valor,
      orden_visual: formData.orden_visual,
      es_activo: formData.es_activo,
      color_hex: isColor ? formData.color_hex : null, // Regla explícita del prompt
    };
    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Valor' : 'Nuevo Valor'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Valor (ej: XL, Algodón, Verde)"
              name="valor"
              value={formData.valor}
              onChange={handleChange}
              fullWidth
              required
            />
            {isColor && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Color Hexagonal"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleChange}
                  fullWidth
                />
                <input
                  type="color"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleChange}
                  style={{ width: 40, height: 40, padding: 0, cursor: 'pointer' }}
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
            />
            <FormControlLabel
              control={<Checkbox name="es_activo" checked={formData.es_activo} onChange={handleChange} />}
              label="Está activo"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained">Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};