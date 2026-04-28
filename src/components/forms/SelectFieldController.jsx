// Select reutilizable para formularios controlados.

import { MenuItem, TextField } from '@mui/material';

export const SelectFieldController = ({ name, label, value, onChange, options = [], getValue = (item) => item.id, getLabel = (item) => item.nombre, ...props }) => {
  return (
    <TextField select name={name} label={label} value={value} onChange={onChange} {...props}>
      <MenuItem value="">Seleccione</MenuItem>
      {options.map((option) => (
        <MenuItem key={getValue(option)} value={getValue(option)}>{getLabel(option)}</MenuItem>
      ))}
    </TextField>
  );
};
