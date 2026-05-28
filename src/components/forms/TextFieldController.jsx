// Campo de texto reutilizable para formularios controlados.

import React from 'react';
import { TextField } from '@mui/material';

export const TextFieldController = ({
  name,
  label,
  value = '',
  onChange,
  onBlur,
  error = false,
  errorText = '',
  helperText = '',
  ...props
}) => {
  const hasError = Boolean(error || errorText);

  return (
    <TextField
      {...props}
      fullWidth
      name={name}
      label={label}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      error={hasError}
      helperText={errorText || helperText}
    />
  );
};