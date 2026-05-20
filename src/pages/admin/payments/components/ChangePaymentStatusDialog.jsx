import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Grid, TextField, MenuItem, Box, useTheme, alpha
} from '@mui/material';

export const ChangePaymentStatusDialog = ({ open, pago, isUpdating, onClose, onConfirm }) => {
  const theme = useTheme();
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [errorDesc, setErrorDesc] = useState('');

  // Sincronizar el estado inicial cuando se abre el modal
  useEffect(() => {
    if (open && pago) {
      setNuevoEstado('');
      setComentario('');
      setErrorDesc('');
    }
  }, [open, pago]);

  if (!pago) return null;

  // Lógica de opciones permitidas (Regla de Negocio FrontEnd)
  const getOpcionesPermitidas = (estadoActual) => {
    if (estadoActual === 'pendiente') {
      return [
        { value: 'aprobado', label: 'Aprobar Pago' },
        { value: 'rechazado', label: 'Rechazar Pago' }
      ];
    }
    // Si es aprobado o rechazado, solo puede volver a pendiente
    return [{ value: 'pendiente', label: 'Volver a Pendiente (Revisión)' }];
  };

  const opciones = getOpcionesPermitidas(pago.estado);

  const handleSubmit = async () => {
    // Validaciones
    if (!nuevoEstado) {
      setErrorDesc('Debe seleccionar un nuevo estado.');
      return;
    }
    if (nuevoEstado === pago.estado) {
      setErrorDesc('El pago ya se encuentra en ese estado.');
      return;
    }
    if (nuevoEstado === 'pendiente' && !comentario.trim()) {
      setErrorDesc('Debe ingresar un motivo para volver el pago a pendiente.');
      return;
    }

    try {
      await onConfirm({
        pagoId: pago.id,
        estadoNuevo: nuevoEstado,
        comentario: comentario.trim()
      });
      onClose();
    } catch (error) {
      setErrorDesc(error.response?.data?.message || 'Error al actualizar el estado del pago.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
  };

  return (
    <Dialog open={open} onClose={isUpdating ? null : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Cambiar Estado del Pago</DialogTitle>
      
      <DialogContent dividers>
        {/* Ficha resumen de solo lectura */}
        <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
           <Grid container spacing={2}>
              <Grid xs={6}>
                 <Typography variant="caption" color="text.secondary">N° Pedido</Typography>
                 <Typography variant="body2" fontWeight="bold">{pago.numero_pedido}</Typography>
              </Grid>
              <Grid xs={6}>
                 <Typography variant="caption" color="text.secondary">Estado Actual</Typography>
                 <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>{pago.estado}</Typography>
              </Grid>
              <Grid xs={6}>
                 <Typography variant="caption" color="text.secondary">Cliente</Typography>
                 <Typography variant="body2">{pago.nombre_cliente}</Typography>
              </Grid>
              <Grid xs={6}>
                 <Typography variant="caption" color="text.secondary">Monto y Método</Typography>
                 <Typography variant="body2">{formatCurrency(pago.monto)} ({pago.metodo_pago})</Typography>
              </Grid>
           </Grid>
        </Box>

        {errorDesc && (
            <Typography color="error" variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
              • {errorDesc}
            </Typography>
        )}

        {/* Zona Editable */}
        <TextField
          select
          fullWidth
          label="Nuevo Estado"
          value={nuevoEstado}
          onChange={(e) => {
             setNuevoEstado(e.target.value);
             setErrorDesc('');
          }}
          disabled={isUpdating}
          sx={{ mb: 3 }}
        >
          {opciones.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Comentario o Motivo"
          placeholder={nuevoEstado === 'pendiente' ? "Escribe obligatoriamente por qué vuelves el pago a pendiente..." : "Opcional"}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          disabled={isUpdating}
          required={nuevoEstado === 'pendiente'}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={isUpdating} color="inherit">
          Cancelar
        </Button>
        <Button 
           onClick={handleSubmit} 
           variant="contained" 
           disabled={isUpdating || !nuevoEstado}
           disableElevation
        >
          {isUpdating ? 'Guardando...' : 'Confirmar Cambio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};