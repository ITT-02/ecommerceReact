
  import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Box, useTheme, alpha
} from '@mui/material';

export const CancelMovementDialog = ({ open, movimiento, onClose, onConfirm, isCanceling }) => {
  const [motivo, setMotivo] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const theme = useTheme();

    const handleConfirm = async () => {
      if (!motivo.trim()) {
        return setErrorMsg('El motivo de anulación es obligatorio.');
      }
      try {
        await onConfirm({ movimientoId: movimiento.id, motivoAnulacion: motivo });
        setMotivo('');
        setErrorMsg('');
        onClose(); // Cerramos solo si el backend confirma
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Error anulando el movimiento');
      }
    };

    if (!movimiento) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>Anular Movimiento</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Estás a punto de anular un movimiento de tipo <strong>{movimiento.tipo_movimiento}</strong> para el producto <strong>{movimiento.producto_nombre}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            El sistema creará un movimiento compensatorio automático. <strong>Esta acción es irreversible y quedará registrada en auditoría.</strong>
          </Typography>
          
          {errorMsg && (
          <Box sx={{ 
            p: 1.5, mb: 2, borderRadius: 1,
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.15) : 'error.light', 
            color: theme.palette.mode === 'dark' ? 'error.light' : 'error.contrastText', 
            border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
            borderColor: 'error.main'
          }}>
            <Typography variant="body2" fontWeight="500">{errorMsg}</Typography>
          </Box>
        )}

          <TextField
            fullWidth
            required
            autoFocus
            label="Motivo o Justificación de la Anulación"
            multiline
            rows={3}
            value={motivo}
            onChange={(e) => {
              setMotivo(e.target.value);
              if(errorMsg) setErrorMsg(''); // Limpia el error mientras escribe
            }}
            placeholder="Ej: Error de digitación, Variante equivocada, etc..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button onClick={handleConfirm} color="error" variant="contained" disabled={isCanceling}>
            {isCanceling ? 'Anulando...' : 'Confirmar Anulación'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };