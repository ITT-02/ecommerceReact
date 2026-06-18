/**
 * TextField reutilizable para formularios de autenticación.
 */

import { InputAdornment, TextField } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const AuthFormTextField = ({
  icon: Icon,
  endAdornment = null,
  slotProps,
  helperText,
  sx,
  ...props
}) => {
  const inputSlotProps = slotProps?.input || {};

  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      helperText={helperText || ' '}
      sx={[
        (theme) => {
          const colors = theme.palette.custom.colors;
          const isDark = theme.palette.mode === 'dark';

          const textColor = isDark
            ? colors.metal.silver100
            : colors.emerald[900];

          const labelColor = isDark
            ? alpha(colors.warm.ivory, 0.72)
            : alpha(colors.emerald[900], 0.78);

          const iconColor = isDark
            ? alpha(colors.warm.ivory, 0.64)
            : alpha(colors.emerald[900], 0.62);

          const inputBg = isDark
            ? alpha(colors.carbon[950], 0.48)
            : alpha(colors.warm.white, 0.68);

          const inputFocusBg = isDark
            ? alpha(colors.carbon[925], 0.92)
            : alpha(colors.warm.white, 0.94);

          const borderColor = isDark
            ? alpha(colors.gold[650], 0.34)
            : alpha(colors.gold[700], 0.42);

          const borderHover = isDark
            ? alpha(colors.gold[550], 0.74)
            : alpha(colors.gold[700], 0.76);

          const borderFocus = isDark
            ? colors.gold[550]
            : colors.gold[700];

          return {
            '& .MuiInputLabel-root': {
              color: labelColor,
              fontWeight: 700,
              fontSize: 14,
            },

            '& .MuiInputLabel-root.Mui-focused': {
              color: borderFocus,
            },

            '& .MuiOutlinedInput-root': {
              minHeight: 56,
              borderRadius: theme.palette.custom.radius.xs,
              bgcolor: inputBg,
              color: textColor,
              overflow: 'hidden',
              transition: theme.transitions.create(
                ['border-color', 'box-shadow', 'background-color'],
                {
                  duration: theme.transitions.duration.short,
                },
              ),

              '& fieldset': {
                borderColor,
              },

              '&:hover fieldset': {
                borderColor: borderHover,
              },

              '&.Mui-focused fieldset': {
                borderColor: borderFocus,
              },

              '&.Mui-focused': {
                bgcolor: inputFocusBg,
                boxShadow: `0 0 0 3px ${alpha(borderFocus, 0.16)}`,
              },
            },

            '& .MuiInputBase-input': {
              color: textColor,
              fontWeight: 600,
              '&::placeholder': {
                color: isDark
                  ? alpha(colors.warm.ivory, 0.42)
                  : alpha(colors.emerald[900], 0.42),
                opacity: 1,
              },
            },

            '& .MuiInputAdornment-root svg': {
              color: iconColor,
            },

            '& .MuiIconButton-root': {
              color: iconColor,
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: alpha(borderFocus, 0.10),
                color: borderFocus,
              },
            },

            '& .MuiFormHelperText-root': {
              mx: 0,
              fontSize: 12,
              color: isDark
                ? alpha(colors.warm.ivory, 0.56)
                : undefined,
            },
          };
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
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