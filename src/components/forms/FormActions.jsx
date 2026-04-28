// Botones estándar de formularios.

import { Button, Stack } from '@mui/material';

export const FormActions = ({ editing = false, loading = false, onCancel }) => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 2 }}>
      {editing && <Button type="button" variant="outlined" onClick={onCancel}>Cancelar</Button>}
      <Button type="submit" variant="contained" disabled={loading}>{editing ? 'Actualizar' : 'Guardar'}</Button>
    </Stack>
  );
};
