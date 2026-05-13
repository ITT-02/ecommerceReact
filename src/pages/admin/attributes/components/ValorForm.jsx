import { useEffect, useState } from 'react';
import {
  Button,
  Switch, 
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Stack,
  Box,
  Typography 
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
    
    let processValue;
    if (type === 'checkbox') {
      processValue = checked;
    } else if (type === 'number') {
      processValue = Math.max(0, Number(value));
    } else {
      processValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      valor: formData.valor,
      orden_visual: formData.orden_visual,
      es_activo: formData.es_activo,
      color_hex: isColor ? formData.color_hex : null,
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
                <input
                  type="color"
                  name="color_hex"
                  value={formData.color_hex}
                  onChange={handleChange}
                  style={{ width: 56, height: 56, padding: 0, cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <TextField
                  label="Color Hexagonal"
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
              slotProps={{
                htmlInput: { min: 0 }
              }}
            />
            {/* AQUÍ APLICAMOS EL SWITCH ESCALADO */}
            <FormControlLabel
              control={
                <Switch 
                  color="success"
                  name="es_activo" 
                  checked={formData.es_activo} 
                  onChange={handleChange}
                  sx={{ transform: 'scale(1.2)', ml: 1, mr: 1 }} // Escala para hacerlo más "grandesito"
                />
              }
              label={<Typography sx={{ fontWeight: 500 }}>Está activo</Typography>}
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