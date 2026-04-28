// Campo visual para seleccionar una imagen local antes de subirla.

import { Button, Stack, Typography } from '@mui/material';

export const ImageUploadField = ({ label = 'Seleccionar imagen', file, onChange }) => {
  return (
    <Stack spacing={1}>
      <Button component="label" variant="outlined">
        {label}
        <input hidden type="file" accept="image/*" onChange={onChange} />
      </Button>
      {file && <Typography variant="body2" color="text.secondary">{file.name}</Typography>}
    </Stack>
  );
};
