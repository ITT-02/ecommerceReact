// Botones estándar de formularios.

import { Button, CircularProgress, Stack } from '@mui/material';

export const FormActions = ({ loading = false, onCancel }) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ justifyContent: 'flex-end', mt: 2 }}
    >
      <Button
        type="button"
        variant="outlined"
        onClick={onCancel}
        disabled={loading}
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          'Guardar'
        )}
      </Button>
    </Stack>
  );
};