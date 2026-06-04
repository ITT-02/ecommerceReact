/**
 * TextField reutilizable para formularios de autenticación.
 */

import { InputAdornment, TextField } from '@mui/material';

export const AuthFormTextField = ({
  icon: Icon,
  endAdornment = null,
  slotProps,
  helperText,
  ...props
}) => {
  const inputSlotProps = slotProps?.input || {};

  return (
    <TextField
      fullWidth
      {...props}
      helperText={helperText || ' '}
      slotProps={{
        ...slotProps,
        input: {
          ...inputSlotProps,
          startAdornment: Icon ? (
            <InputAdornment position="start">
              <Icon fontSize="small" />
            </InputAdornment>
          ) : (
            inputSlotProps.startAdornment
          ),
          endAdornment: endAdornment || inputSlotProps.endAdornment,
        },
      }}
    />
  );
};