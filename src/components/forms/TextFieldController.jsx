// Campo de texto reutilizable para formularios controlados usando react-hook-form.
import React from 'react';
import { TextField } from '@mui/material';
import { Controller } from 'react-hook-form';

export const TextFieldController = ({ name, control, label, rules, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          fullWidth
          label={label}
          value={value || ''}
          onChange={onChange}
          error={!!error}
          helperText={error ? error.message : null}
          {...props}
        />
      )}
    />
  );
};