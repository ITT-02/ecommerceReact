// Formulario para crear y editar banners.

import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

import { AdminSectionCard } from '../AdminSectionCard';
import { ImageUploadField } from '../../forms/ImageUploadField';
import { TextFieldController } from '../../forms/TextFieldController';

export const BannerForm = ({
  editingId,
  formData,
  loading = false,
  onCancel,
  onChange,
  onSubmit,
}) => {

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        <AdminSectionCard title="Contenido del banner">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldController fullWidth required name="titulo" label="Titulo" value={formData.titulo} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldController fullWidth name="subtitulo" label="Subtitulo" value={formData.subtitulo} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldController
                fullWidth
                name="url_destino"
                label="URL destino"
                value={formData.url_destino}
                onChange={onChange}
                helperText="Ruta interna como /catalogo o una URL completa."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldController
                fullWidth
                name="boton_texto"
                label="Texto del boton"
                value={formData.boton_texto}
                onChange={onChange}
                placeholder="Ver catalogo"
              />
            </Grid>
          </Grid>
        </AdminSectionCard>

      

        <AdminSectionCard title="Publicacion">
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                fullWidth
                name="fecha_inicio"
                label="Fecha inicio"
                type="date"
                value={formData.fecha_inicio || ''}
                onChange={onChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController
                fullWidth
                name="fecha_fin"
                label="Fecha fin"
                type="date"
                value={formData.fecha_fin || ''}
                onChange={onChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldController fullWidth name="orden_visual" label="Orden visual" type="number" value={formData.orden_visual ?? ''} onChange={onChange} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="es_activo"
                    checked={Boolean(formData.es_activo)}
                    onChange={onChange}
                  />
                }
                label="Publicar banner"
              />
            </Grid>
          </Grid>
        </AdminSectionCard>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'flex-end', mt: 2 }}>
        <Button type="button" variant="outlined" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
        </Button>
      </Stack>
    </Box>
  );
};
