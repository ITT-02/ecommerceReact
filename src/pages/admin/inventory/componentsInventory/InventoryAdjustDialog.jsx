import React, { useState, useEffect } from 'react';
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
   useTheme, alpha
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export const InventoryAdjustDialog = ({ 
  open, 
  onClose, 
  data, 
  onConfirm,
  loading 
}) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    nuevoStockFinal: 0,
    referenciaTipo: 'conteo_fisico',
    notas: '',
  });
  const [error, setError] = useState(null);

  // Sincroniza el estado del formulario cada vez que cambia el recurso o abre el diálogo
  useEffect(() => {
    if (data && open) {
      setFormData({
        nuevoStockFinal: data.cantidad_disponible || 0,
        referenciaTipo: 'conteo_fisico',
        notas: '',
      });
      setError(null);
    }
  }, [data, open]);

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
    const handleClose = () => {
      document.activeElement?.blur();
      onClose();
  };

  return (
   <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="lg" 
      fullWidth
    >
      <DialogTitle sx={{ pr: 6 }}>
        Ajustar Stock
        <IconButton
          onClick={handleClose}
          size="small"
          aria-label="Cerrar diálogo de movimientos"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box
          sx={{
            mb: 3,
            p: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
              <Typography variant="caption" color="text.secondary" fontWeight={800}>
                PRODUCTO
              </Typography>

              <Typography variant="h6" fontWeight={900}>
                {data.producto_nombre || '-'}
              </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            <strong>Variante: </strong> {data.nombre_variante}  | <strong>Almacén:</strong> {data.almacen_nombre}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 0.5 }}>
          {/* Nuevo stock FINAL */}
          <TextField
            label="Nuevo stock final"
            type="number"
            value={formData.nuevoStockFinal}
            onChange={(e) => setFormData({ 
              ...formData, 
              nuevoStockFinal: parseInt(e.target.value, 10) || 0 
            })}
            fullWidth
            helperText="Ingrese el stock físico final después del ajuste"
            slotProps={{ input: { min: 0 } }}
            disabled={loading}
          />

          {/* Motivo del ajuste */}
          <FormControl fullWidth>
            <InputLabel id="adjust-reason-label">Motivo / Referencia</InputLabel>
            <Select
              labelId="adjust-reason-label"
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
            disabled={loading}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Ajustar stock'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};