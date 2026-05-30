// Configuración administrativa de multimedia ya guardada.
// Permite editar portada, visibilidad, orden, texto alternativo y asociación a variante.

import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';

const isLocalFile = (item) => item instanceof File;

const getMediaUrl = (item) => item?.url_archivo || item?.url || item?.src || '';

const getVariantLabel = (variant) =>
  variant?.nombre_variante ||
  variant?.etiqueta_medida ||
  variant?.codigoproducto ||
  variant?.codigoProducto ||
  'Variante';

export const ProductMediaSettings = ({
  media = [],
  variants = [],
  productName = 'Producto',
  onChange,
}) => {
  const savedMedia = media.filter((item) => item?.id && !isLocalFile(item));

  const handleMediaChange = (mediaId, field, value) => {
    const nextMedia = media.map((item) => {
      if (item?.id !== mediaId) return item;

      return {
        ...item,
        [field]: value,
      };
    });

    onChange?.(nextMedia);
  };

  const handleCoverChange = (targetMedia, checked) => {
    const targetGroup = targetMedia.variante_id || '';

    const nextMedia = media.map((item) => {
      if (!item?.id || isLocalFile(item)) return item;

      const itemGroup = item.variante_id || '';

      // Solo puede existir una portada por grupo:
      // - grupo vacío: portada general del producto
      // - grupo con UUID: portada de esa variante
      if (checked && itemGroup === targetGroup) {
        return {
          ...item,
          es_portada: item.id === targetMedia.id,
        };
      }

      if (item.id === targetMedia.id) {
        return {
          ...item,
          es_portada: checked,
        };
      }

      return item;
    });

    onChange?.(nextMedia);
  };

  const handleVariantChange = (targetMedia, nextVariantId) => {
    const nextMedia = media.map((item) => {
      if (item?.id !== targetMedia.id) return item;

      return {
        ...item,
        variante_id: nextVariantId || null,
        // Al cambiar de grupo, se desmarca portada para evitar conflicto visual.
        es_portada: false,
      };
    });

    onChange?.(nextMedia);
  };

  if (!savedMedia.length) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 1,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Guarda el producto para configurar portada, visibilidad, orden o asociación a variantes.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="subtitle2" fontWeight={800}>
          Configuración de multimedia guardada
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Usa “Asociar a variante” cuando una imagen represente un color, medida o presentación específica.
        </Typography>
      </Box>

      {savedMedia.map((item, index) => {
        const mediaUrl = getMediaUrl(item);
        const isVideo = item.tipo_multimedia === 'video' || item.type?.startsWith?.('video/');

        return (
          <Card key={item.id} variant="outlined" sx={{ boxShadow: 'none' }}>
            <CardContent>
              <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 120,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {isVideo ? (
                      <Stack spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                        <MovieOutlinedIcon />
                        <Typography variant="caption">Video</Typography>
                      </Stack>
                    ) : (
                      <Box
                        component="img"
                        src={mediaUrl}
                        alt={item.texto_alternativo || productName}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 9 }}>
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Texto alternativo"
                        value={item.texto_alternativo || ''}
                        onChange={(event) =>
                          handleMediaChange(item.id, 'texto_alternativo', event.target.value)
                        }
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Orden"
                        value={item.orden_visual ?? index + 1}
                        onChange={(event) =>
                          handleMediaChange(item.id, 'orden_visual', Number(event.target.value || 1))
                        }
                        slotProps={{ htmlInput: { min: 1 } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <Chip
                        label={isVideo ? 'Video' : 'Imagen'}
                        color={isVideo ? 'secondary' : 'primary'}
                        variant="outlined"
                        sx={{ height: 38, borderRadius: 1, width: '100%' }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Asociar a variante"
                        value={item.variante_id || ''}
                        onChange={(event) => handleVariantChange(item, event.target.value)}
                        helperText="Vacío = multimedia general del producto. Selecciona variante para imagen por color/medida."
                      >
                        <MenuItem value="">Multimedia general del producto</MenuItem>
                        {variants.map((variant) => (
                          <MenuItem key={variant.id} value={variant.id}>
                            {getVariantLabel(variant)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap' }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(item.es_portada)}
                              onChange={(event) => handleCoverChange(item, event.target.checked)}
                            />
                          }
                          label={item.variante_id ? 'Portada de variante' : 'Portada general'}
                        />

                        <FormControlLabel
                          control={
                            <Switch
                              checked={item.es_publica ?? true}
                              onChange={(event) =>
                                handleMediaChange(item.id, 'es_publica', event.target.checked)
                              }
                            />
                          }
                          label={item.es_publica === false ? 'Oculta en tienda' : 'Visible en tienda'}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );
};
