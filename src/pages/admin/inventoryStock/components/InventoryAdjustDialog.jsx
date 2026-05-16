// src/pages/admin/inventoryStock/components/InventoryAdjustDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export const InventoryAdjustDialog = ({ 
  open, 
  onClose, 
  data, 
  onConfirm,
  loading 
}) => {
  const [formData, setFormData] = useState({
    nuevoStockFinal: data?.cantidad_disponible || 0,
    referenciaTipo: 'conteo_fisico',
    notas: '',
  });
  const [error, setError] = useState(null);

  if (!data) return null;

  const handleSubmit = async () => {
    if (formData.nuevoStockFinal < 0) {
      setError('El stock final no puede ser negativo');
      return;
    }
    
    setError(null);
    try {
      await onConfirm(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al ajustar el stock');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Ajustar stock
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
          disabled={loading}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {/* Información de contexto - SOLO LECTURA */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2"><strong>Producto:</strong> {data.producto_nombre}</Typography>
          <Typography variant="body2"><strong>Variante:</strong> {data.nombre_variante}</Typography>
          <Typography variant="body2"><strong>Almacén:</strong> {data.almacen_nombre}</Typography>
          <Typography variant="body2"><strong>Stock actual:</strong> {data.cantidad_disponible?.toLocaleString() || '0'}</Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Nuevo stock FINAL */}
          <TextField
            label="Nuevo stock final"
            type="number"
            value={formData.nuevoStockFinal}
            onChange={(e) => setFormData({ 
              ...formData, 
              nuevoStockFinal: parseInt(e.target.value) || 0 
            })}
            fullWidth
            helperText="Ingrese el stock físico final después del ajuste"
            InputProps={{ inputProps: { min: 0 } }}
            disabled={loading}
          />

          {/* Motivo del ajuste */}
          <FormControl fullWidth>
            <InputLabel>Motivo / Referencia</InputLabel>
            <Select
              value={formData.referenciaTipo}
              onChange={(e) => setFormData({ ...formData, referenciaTipo: e.target.value })}
              label="Motivo / Referencia"
              disabled={loading}
            >
              <MenuItem value="conteo_fisico">Conteo físico</MenuItem>
              <MenuItem value="ajuste_manual">Ajuste manual</MenuItem>
              <MenuItem value="correccion_stock">Corrección de stock</MenuItem>
            </Select>
          </FormControl>

          {/* Notas opcionales */}
          <TextField
            label="Notas"
            multiline
            rows={3}
            value={formData.notas}
            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
            fullWidth
            placeholder="Detalle opcional de la corrección"
            disabled={loading}
          />
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Ajustar stock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};