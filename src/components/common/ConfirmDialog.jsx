// Diálogo de confirmación reutilizable.

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

export const ConfirmDialog = ({ open, title, message, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="error">Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
};
