// Campo numérico reutilizable para formularios controlados.

import { TextField } from '@mui/material';

export const NumberFieldController = ({
  name,
  label,
  value,
  onChange,
  min = 0,
  step = '1',
  size = 'medium',
  variant = 'outlined',
  fullWidth = true,
  slotProps,
  ...props
}) => {
  return (
    <TextField
      type="number"
      name={name}
      label={label}
      value={value ?? ''}
      onChange={onChange}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      slotProps={{
        ...slotProps,
        htmlInput: {
          min,
          step,
          inputMode: step === '1' ? 'numeric' : 'decimal',
          ...(slotProps?.htmlInput || {}),
        },
      }}
      {...props}
    />
  );
};
