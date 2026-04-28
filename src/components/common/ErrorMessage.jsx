// Mensaje de error reutilizable.

import { Alert } from '@mui/material';

export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>;
};
