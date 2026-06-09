// Formulario para crear y editar banners.

import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

import { AdminSectionCard } from '../AdminSectionCard';
import { TextFieldController } from '../../forms/TextFieldController';
import { FileUploadField } from '../../common/Field/FileUploadField';
import { BANNER_HOME_PLACEMENT_OPTIONS } from '../../../adapters/bannersMapper';

export const BannerForm = ({
  editingId,
  formData,
  loading = false,
  onCancel,
  onChange,
  onFileChange,
  onFileRemove,
  onSubmit,
}) => {
  const selectedPlacement = BANNER_HOME_PLACEMENT_OPTIONS.find(
    (option) => option.value === formData.ubicacion_home
  );

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        <AdminSectionCard title="Contenido del banner">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldController
                fullWidth
                required
                name="titulo"
                label="Título"
                value={formData.titulo}
                onChange={onChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldController
                fullWidth
                name="subtitulo"
                label="Subtítulo"
                value={formData.subtitulo}
                onChange={onChange}
              />
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
                label="Texto del botón"
                value={formData.boton_texto}
                onChange={onChange}
              />
            </Grid>

            <FileUploadField
              label="Imagen del banner"
              accept="image/*"
              value={formData._file}
              previewUrl={formData.imagen_url}
              height={220}
              helperText="Selecciona una imagen para el banner."
              onChange={onFileChange}
              onRemove={onFileRemove}
            />
          </Grid>
        </AdminSectionCard>

        <AdminSectionCard title="Ubicación en inicio">
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextFieldController
                select
                fullWidth
                name="ubicacion_home"
                label="Mostrar como"
                value={formData.ubicacion_home}
                onChange={onChange}
                helperText={selectedPlacement?.description || 'Define en qué sección aparecerá el banner.'}
              >
                {BANNER_HOME_PLACEMENT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextFieldController>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                El carrusel principal rota automáticamente los banners configurados para esa sección.
                Las tarjetas secundarias permanecen debajo como campañas destacadas.
              </Typography>
            </Grid>
          </Grid>
        </AdminSectionCard>

        <AdminSectionCard title="Publicación">
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
              <TextFieldController
                fullWidth
                name="orden_visual"
                label="Orden visual"
                type="number"
                value={formData.orden_visual ?? ''}
                onChange={onChange}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 1,
                  },
                }}
                helperText="Menor número aparece primero."
              />
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
                label={formData.es_activo ? 'Activo' : 'Inactivo'}
              />
            </Grid>
          </Grid>
        </AdminSectionCard>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end', mt: 2 }}
      >
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
