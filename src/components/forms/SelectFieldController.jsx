// Select reutilizable para formularios controlados.

import React from 'react';
import { TextField } from '@mui/material';

export const SelectFieldController = ({
  name,
  label,
  value = '',
  onChange,
  onBlur,
  error = false,
  errorText = '',
  helperText = '',
  children,
  ...props
}) => {
  const hasError = Boolean(error || errorText);

  return (
    <TextField
      {...props}
      select
      fullWidth
      name={name}
      label={label}
      value={value ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      error={hasError}
      helperText={errorText || helperText}
    >
      {children}
    </TextField>
  );
};