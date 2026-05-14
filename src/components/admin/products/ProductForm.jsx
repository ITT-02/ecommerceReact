// Formulario administrativo para crear y editar productos base.

import {
  Alert,
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
import { FileUploadField } from '../../common/Field/FileUploadField';
import { TextFieldController } from '../../forms/TextFieldController';

const normalizeMediaFile = (media) => {
  if (media instanceof File) return media;

  const mediaType = media.type || media.tipo_multimedia || 'image/*';

  return {
    ...media,
    src: media.src || media.url_archivo || media.url || '',
    type: mediaType === 'video' ? 'video/*' : mediaType === 'imagen' ? 'image/*' : mediaType,
    name: media.name || media.texto_alternativo || 'Multimedia del producto',
  };
};

const getValue = (value, fallback = '') => value ?? fallback;

export const ProductForm = ({
  editingId,
  formData,
  categories = [],
  loading = false,
  error = '',
  onCancel,
  onChange,
  onMediaChange,
  onMediaRemove,
  onSubmit,
}) => {
  const mediaFieldName = editingId ? 'newMediaFiles' : 'mediaFiles';
  const mediaFiles = (formData[mediaFieldName] || []).map(normalizeMediaFile);

  const handleFieldChange = (name, value) => {
    onMediaChange?.(name, value);
  };

  const handleMediaRemove = (index, removedFile) => {
    if (!editingId || !removedFile?.id) return;

    handleFieldChange('removedMedia', [
      ...(formData.removedMedia || []),
      removedFile,
    ]);

    handleFieldChange('removedMediaIds', [
      ...(formData.removedMediaIds || []),
      removedFile.id,
    ]);

    onMediaRemove?.(removedFile, index, mediaFieldName);
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <AdminSectionCard title="Informacion del producto">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }}>
              <TextFieldController
                required
                name="nombre"
                label="Nombre del producto"
                value={getValue(formData.nombre)}
                onChange={onChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <TextFieldController
                select
                required
                name="categoria_id"
                label="Categoria"
                value={getValue(formData.categoria_id)}
                onChange={onChange}
              >
                <MenuItem value="">Selecciona una categoria</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </TextFieldController>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                multiline
                minRows={2}
                name="descripcion_corta"
                label="Descripcion corta"
                value={getValue(formData.descripcion_corta)}
                onChange={onChange}
                slotProps={{
                  htmlInput: {
                    maxLength: 180,
                  },
                }}
                helperText="Resumen breve para tablas, tarjetas y vistas rapidas."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextFieldController
                multiline
                minRows={4}
                name="descripcion_larga"
                label="Descripcion larga"
                value={getValue(formData.descripcion_larga)}
                onChange={onChange}
              />
            </Grid>
          </Grid>
        </AdminSectionCard>

        <AdminSectionCard title="Multimedia">
          <Stack spacing={1.5}>
            <FileUploadField
              label={editingId ? 'Imagenes/videos del producto' : 'Imagenes/videos'}
              accept="image/*,video/*"
              value={mediaFiles}
              multiple
              maxFiles={5}
              height={170}
              helperText={
                editingId
                  ? 'Aqui puedes ver, quitar, reemplazar o agregar multimedia.'
                  : 'Puedes subir imagenes o videos.'
              }
              onChange={(files) => handleFieldChange(mediaFieldName, files)}
              onRemove={handleMediaRemove}
            />

            
          </Stack>
        </AdminSectionCard>

        <AdminSectionCard title="Configuracion comercial">
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="mostrar_precio"
                    checked={Boolean(formData.mostrar_precio)}
                    onChange={onChange}
                  />
                }
                label="Mostrar precio"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="destacado"
                    checked={Boolean(formData.destacado)}
                    onChange={onChange}
                  />
                }
                label="Producto destacado"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="es_personalizable"
                    checked={Boolean(formData.es_personalizable)}
                    onChange={onChange}
                  />
                }
                label="Personalizable"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    name="requiere_cotizacion"
                    checked={Boolean(formData.requiere_cotizacion)}
                    onChange={onChange}
                  />
                }
                label="Requiere cotizacion"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
          {loading ? 'Guardando...' : editingId ? 'Actualizar producto' : 'Crear producto'}
        </Button>
      </Stack>
    </Box>
  );
};
