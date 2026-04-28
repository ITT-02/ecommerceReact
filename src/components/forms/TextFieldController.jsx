// Campo de texto reutilizable para formularios controlados.

import { TextField } from '@mui/material';

export const TextFieldController = ({ name, label, value, onChange, ...props }) => {
  return <TextField name={name} label={label} value={value} onChange={onChange} {...props} />;
};
