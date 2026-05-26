// Select reutilizable para formularios controlados.
import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

export const SelectFieldController = ({ name, control, label, children, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          select
          fullWidth
          label={label}
          value={value || ''} // Si el valor es undefined, usamos string vacío ''
          onChange={onChange}
          error={!!error}
          helperText={error?.message}
          {...props}
        >
          {children}
        </TextField>
      )}
    />
  );
};