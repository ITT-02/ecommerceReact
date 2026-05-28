// Botones estándar de formularios.
// Se usa como cierre único para crear, editar y cancelar registros.

import { Button, CircularProgress, Stack } from '@mui/material';

export const FormActions = ({
  loading = false,
  onCancel,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  disabled = false,
  sx,
}) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ justifyContent: 'flex-end', mt: 2, ...sx }}
    >
      {onCancel && (
        <Button
          type="button"
          variant="outlined"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.currentTarget.blur();
            onCancel();
          }}
          disabled={loading || disabled}
        >
          {cancelLabel}
        </Button>
      )}

      <Button type="submit" variant="contained" disabled={loading || disabled}>
        {loading ? <CircularProgress size={22} color="inherit" /> : submitLabel}
      </Button>
    </Stack>
  );
};
