// Campo numérico reutilizable.

import { TextField } from '@mui/material';

export const NumberFieldController = ({ name, label, value, onChange, min = 0, step = '1', ...props }) => {
  return (
    <TextField
      type="number"
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      slotProps={{ htmlInput: { min, step } }}
      {...props}
    />
  );
};
