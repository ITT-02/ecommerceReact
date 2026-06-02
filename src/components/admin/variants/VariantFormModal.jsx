import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteIcon from '@mui/icons-material/Delete';

import {
  useProductOptions,
  useVariantAttributes,
} from '../../../hooks/catalog/useVariants';

const DEFAULT_FORM_DATA = {
  producto_id: null,
  codigo_referencia: '',
  medida_largo: '',
  medida_ancho: '',
  medida_alto: '',
  unidad_medida: 'cm',
  peso_gramos: '',
  precio: '',
  precio_comparacion: '',
  costo: '',
  stock_minimo: 5,
  es_predeterminada: false,
  es_activa: true,
};

const generateLocalId = () => {
  return window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
};

const normalizeText = (value) => {
  return typeof value === 'string' ? value.trim() : '';
};

const formatMeasureNumber = (value) => {
  if (value === null || value === undefined || value === '') return '';

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';

  return String(numericValue).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
};

const buildMeasureLabel = ({ largo, ancho, alto, unidad }) => {
  const values = [largo, ancho, alto]
    .map(formatMeasureNumber)
    .filter(Boolean);

  if (!values.length) return '';

  return `${values.join(' x ')} ${unidad || 'cm'}`;
};

const getProductOptionFromVariant = (variant, defaultProduct) => {
  if (defaultProduct?.id) {
    return {
      id: defaultProduct.id,
      nombre: defaultProduct.nombre || defaultProduct.label || 'Producto seleccionado',
      label: defaultProduct.label || defaultProduct.nombre || 'Producto seleccionado',
    };
  }

  if (!variant?.producto_id) return null;

  const productName =
    variant.producto_nombre ||
    variant.productoNombre ||
    variant.productos?.nombre ||
    'Producto mantenido';

  return {
    id: variant.producto_id,
    nombre: productName,
    label: productName,
  };
};

const mapVariantToFormData = ({ variant, defaultProduct }) => {
  return {
    ...DEFAULT_FORM_DATA,
    producto_id: getProductOptionFromVariant(variant, defaultProduct),
    codigo_referencia: variant?.codigo_referencia || '',
    medida_largo: variant?.medida_largo ?? '',
    medida_ancho: variant?.medida_ancho ?? '',
    medida_alto: variant?.medida_alto ?? '',
    unidad_medida: ['cm', 'mm'].includes(variant?.unidad_medida)
      ? variant.unidad_medida
      : 'cm',
    peso_gramos: variant?.peso_gramos ?? '',
    precio: variant?.precio ?? '',
    precio_comparacion: variant?.precio_comparacion ?? '',
    costo: variant?.costo ?? '',
    stock_minimo: variant?.stock_minimo ?? 5,
    es_predeterminada: Boolean(variant?.es_predeterminada),
    es_activa: variant?.es_activa ?? true,
  };
};

const mapVariantAttributesToRows = (variant) => {
  const attrsList = variant?.atributos || variant?.producto_variante_atributos || [];

  if (!Array.isArray(attrsList)) return [];

  return attrsList
    .map((item) => ({
      id: generateLocalId(),
      atributoId:
        item.atributo_id ||
        item.atributoId ||
        item.atributo_valor?.atributo_id ||
        '',
      valorId:
        item.atributo_valor_id ||
        item.atributoValorId ||
        item.valor_id ||
        item.id ||
        '',
    }))
    .filter((item) => item.atributoId || item.valorId);
};

const getSelectedAttributeValues = ({ dynamicAttributes, allowedAttributes }) => {
  const safeAttributes = Array.isArray(allowedAttributes) ? allowedAttributes : [];

  return dynamicAttributes
    .map((item) => {
      const attribute = safeAttributes.find((attr) => attr.id === item.atributoId);
      const values = Array.isArray(attribute?.valores) ? attribute.valores : [];
      const selectedValue = values.find((value) => value.id === item.valorId);

      return normalizeText(selectedValue?.valor);
    })
    .filter(Boolean);
};

const buildVariantPreviewName = ({ formData, dynamicAttributes, allowedAttributes }) => {
  const measureLabel = buildMeasureLabel({
    largo: formData.medida_largo,
    ancho: formData.medida_ancho,
    alto: formData.medida_alto,
    unidad: formData.unidad_medida,
  });

  const attributeValues = getSelectedAttributeValues({
    dynamicAttributes,
    allowedAttributes,
  });

  const parts = [
    normalizeText(formData.codigo_referencia),
    measureLabel,
    ...attributeValues,
  ].filter(Boolean);

  if (parts.length) return parts.join(' · ');

  return 'Variante estándar';
};

export const VariantFormModal = ({
  open,
  variant = null,
  defaultProduct = null,
  mode = 'create',
  onClose,
  onSave,
}) => {
  const normalizedMode = mode === 'duplicate' ? 'duplicate' : variant ? 'edit' : 'create';
  const isEditing = normalizedMode === 'edit';
  const isDuplicate = normalizedMode === 'duplicate';
  const productLocked = isEditing || isDuplicate || Boolean(defaultProduct?.id);
  const costLocked = isEditing;

  const [productSearch, setProductSearch] = useState('');
  const { productOptions, loading: productsLoading } = useProductOptions(productSearch);
  const {
    attributes: allowedAttributes,
    loading: attributesLoading,
  } = useVariantAttributes();

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [dynamicAttributes, setDynamicAttributes] = useState([]);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    if (!open) return;

    setSubmitAttempted(false);
    setProductSearch('');

    if (variant) {
      setFormData(mapVariantToFormData({ variant, defaultProduct }));
      setDynamicAttributes(mapVariantAttributesToRows(variant));
      return;
    }

    setFormData({
      ...DEFAULT_FORM_DATA,
      producto_id: defaultProduct?.id
        ? {
            id: defaultProduct.id,
            nombre: defaultProduct.nombre || defaultProduct.label || 'Producto seleccionado',
            label: defaultProduct.label || defaultProduct.nombre || 'Producto seleccionado',
          }
        : null,
    });
    setDynamicAttributes([]);
  }, [open, variant, defaultProduct]);

  const measureLabel = useMemo(() => {
    return buildMeasureLabel({
      largo: formData.medida_largo,
      ancho: formData.medida_ancho,
      alto: formData.medida_alto,
      unidad: formData.unidad_medida,
    });
  }, [formData.medida_alto, formData.medida_ancho, formData.medida_largo, formData.unidad_medida]);

  const previewName = useMemo(() => {
    return buildVariantPreviewName({
      formData,
      dynamicAttributes,
      allowedAttributes,
    });
  }, [allowedAttributes, dynamicAttributes, formData]);

  const productError = submitAttempted && !formData.producto_id?.id;
  const priceError = submitAttempted && (formData.precio === '' || formData.precio === null);
  const incompleteAttributes = submitAttempted
    ? dynamicAttributes.some((item) => !item.atributoId || !item.valorId)
    : false;

  const modalTitle = {
    create: 'Nueva variante',
    edit: 'Editar variante',
    duplicate: 'Crear variante similar',
  }[normalizedMode];

  const handleClose = () => {
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (type === 'number' && value !== '' && Number(value) < 0) return;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddAttribute = () => {
    const safeAttributes = Array.isArray(allowedAttributes) ? allowedAttributes : [];
    const usedAtributoIds = new Set(
      dynamicAttributes.map((item) => item.atributoId).filter(Boolean)
    );
    const availableTypes = safeAttributes.filter((item) => !usedAtributoIds.has(item.id));

    if (safeAttributes.length > 0 && availableTypes.length === 0) return;

    setDynamicAttributes((prev) => [
      ...prev,
      { id: generateLocalId(), atributoId: '', valorId: '' },
    ]);
  };

  const handleRemoveAttribute = (id) => {
    setDynamicAttributes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAttributeChange = (id, field, value) => {
    setDynamicAttributes((prev) => {
      if (field === 'atributoId' && value) {
        const alreadyUsed = prev.some(
          (item) => item.id !== id && item.atributoId === value
        );

        if (alreadyUsed) return prev;
      }

      return prev.map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          [field]: value,
          ...(field === 'atributoId' ? { valorId: '' } : {}),
        };
      });
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (!formData.producto_id?.id) return;
    if (formData.precio === '' || formData.precio === null) return;

    const hasIncompleteAttributes = dynamicAttributes.some(
      (item) => !item.atributoId || !item.valorId
    );

    if (hasIncompleteAttributes) return;

    const atributoIds = dynamicAttributes.map((item) => item.atributoId).filter(Boolean);
    if (atributoIds.length !== new Set(atributoIds).size) return;

    const variantPayload = {
      producto_id: formData.producto_id.id,
      codigo_referencia: normalizeText(formData.codigo_referencia) || null,
      nombre_variante: previewName,
      medida_largo: formData.medida_largo ? Number(formData.medida_largo) : null,
      medida_ancho: formData.medida_ancho ? Number(formData.medida_ancho) : null,
      medida_alto: formData.medida_alto ? Number(formData.medida_alto) : null,
      unidad_medida: formData.unidad_medida || 'cm',
      etiqueta_medida: measureLabel || null,
      peso_gramos: formData.peso_gramos ? Number(formData.peso_gramos) : null,
      precio: Number(formData.precio || 0),
      precio_comparacion: formData.precio_comparacion
        ? Number(formData.precio_comparacion)
        : null,
      costo: formData.costo ? Number(formData.costo) : null,
      stock_minimo: Number(formData.stock_minimo || 5),
      es_predeterminada: Boolean(formData.es_predeterminada),
      es_activa: Boolean(formData.es_activa),
    };

    onSave?.({
      variant: variantPayload,
      attributes: dynamicAttributes
        .filter((item) => item.valorId)
        .map((item) => ({ atributo_valor_id: item.valorId })),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            maxHeight: { xs: 'calc(100dvh - 16px)', sm: 'calc(100dvh - 48px)' },
          },
        },
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ minHeight: 0 }}>
        <DialogTitle sx={{ pr: 6, fontWeight: 900 }}>
          {modalTitle}
        </DialogTitle>

        <IconButton
          onMouseDown={(event) => event.preventDefault()}
          onClick={handleClose}
          size="small"
          aria-label="Cerrar formulario de variante"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>

        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={productOptions}
                getOptionLabel={(option) => option?.nombre || option?.label || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                loading={productsLoading}
                disabled={productLocked}
                onInputChange={(_event, newInputValue) => setProductSearch(newInputValue)}
                value={formData.producto_id}
                onChange={(_event, newValue) => {
                  setFormData((prev) => ({ ...prev, producto_id: newValue }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Producto"
                    required
                    error={productError}
                    helperText={
                      productError
                        ? 'Selecciona el producto al que pertenece la variante.'
                        : productLocked
                          ? 'El producto queda fijo para conservar inventario, pedidos e historial.'
                          : 'Busca y selecciona el producto.'
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Modelo / referencia"
                name="codigo_referencia"
                placeholder="Ingrese referencia corta del modelo (opcional)"
                value={formData.codigo_referencia}
                onChange={handleChange}
                
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 900 }}>
                Medidas opcionales
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Largo"
                    name="medida_largo"
                    type="number"
                    value={formData.medida_largo}
                    onChange={handleChange}
                    slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Ancho"
                    name="medida_ancho"
                    type="number"
                    value={formData.medida_ancho}
                    onChange={handleChange}
                    slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Alto"
                    name="medida_alto"
                    type="number"
                    value={formData.medida_alto}
                    onChange={handleChange}
                    slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    select
                    fullWidth
                    label="Unidad"
                    name="unidad_medida"
                    value={formData.unidad_medida}
                    onChange={handleChange}
                  >
                    <MenuItem value="cm">cm</MenuItem>
                    <MenuItem value="mm">mm</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Las medidas se usarán para construir la opción de medida del catálogo.
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Peso opcional"
                name="peso_gramos"
                type="number"
                value={formData.peso_gramos}
                onChange={handleChange}
                slotProps={{
                  htmlInput: { min: 0, step: '0.01' },
                  input: { endAdornment: <InputAdornment position="end">g</InputAdornment> },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="Precio de venta"
                name="precio"
                type="number"
                value={formData.precio}
                onChange={handleChange}
                error={priceError}
                helperText={priceError ? 'Ingresa el precio de venta.' : undefined}
                slotProps={{
                  htmlInput: { min: 0, step: '0.01' },
                  input: { startAdornment: <InputAdornment position="start">S/</InputAdornment> },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Precio comparativo"
                name="precio_comparacion"
                type="number"
                value={formData.precio_comparacion}
                onChange={handleChange}
                slotProps={{
                  htmlInput: { min: 0, step: '0.01' },
                  input: { startAdornment: <InputAdornment position="start">S/</InputAdornment> },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label={costLocked ? 'Costo promedio' : 'Costo inicial opcional'}
                name="costo"
                type="number"
                value={formData.costo}
                onChange={handleChange}
                disabled={costLocked}
                helperText={
                  costLocked
                    ? 'Se actualiza desde recepción de mercadería.'
                    : 'Puedes dejarlo vacío.'
                }
                slotProps={{
                  htmlInput: { min: 0, step: '0.01' },
                  input: { startAdornment: <InputAdornment position="start">S/</InputAdornment> },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                required
                label="Stock mínimo"
                name="stock_minimo"
                type="number"
                value={formData.stock_minimo}
                onChange={handleChange}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 0.5, sm: 2 }}
                sx={{ height: '100%', justifyContent: 'center' }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(formData.es_predeterminada)}
                      onChange={handleChange}
                      name="es_predeterminada"
                    />
                  }
                  label="Mostrar primero en tienda"
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(formData.es_activa)}
                      onChange={handleChange}
                      name="es_activa"
                      color="primary"
                    />
                  }
                  label={formData.es_activa ? 'Estado activo' : 'Estado inactivo'}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 0.5 }} />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 2 }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    Atributos dinámicos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Agrega valores. El catálogo los mostrará como opciones separadas.
                  </Typography>
                </Box>

                <Button
                  type="button"
                  startIcon={<AddIcon />}
                  variant="outlined"
                  onClick={handleAddAttribute}
                  disabled={attributesLoading}
                >
                  Agregar atributo
                </Button>
              </Stack>

              {dynamicAttributes.map((attr, index) => {
                const safeAttributes = Array.isArray(allowedAttributes) ? allowedAttributes : [];
                const selectedAttributeDef = safeAttributes.find((item) => item.id === attr.atributoId);
                const valuesOptions = Array.isArray(selectedAttributeDef?.valores)
                  ? selectedAttributeDef.valores
                  : [];
                const usedElsewhere = new Set(
                  dynamicAttributes
                    .filter((item) => item.id !== attr.id && item.atributoId)
                    .map((item) => item.atributoId)
                );
                const attributeError = submitAttempted && !attr.atributoId;
                const valueError = submitAttempted && !attr.valorId;

                return (
                  <Paper
                    key={attr.id}
                    variant="outlined"
                    sx={{ p: 2, mb: 2, borderRadius: 2.5, bgcolor: 'background.default' }}
                  >
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          select
                          fullWidth
                          label={`Atributo ${index + 1}`}
                          value={attr.atributoId || ''}
                          onChange={(event) => handleAttributeChange(attr.id, 'atributoId', event.target.value)}
                          error={attributeError}
                          helperText={attributeError ? 'Selecciona el atributo.' : undefined}
                        >
                          <MenuItem value="" disabled>
                            Seleccione un atributo
                          </MenuItem>
                          {safeAttributes.map((item) => (
                            <MenuItem
                              key={item.id}
                              value={item.id}
                              disabled={usedElsewhere.has(item.id)}
                            >
                              {item.nombre}{usedElsewhere.has(item.id) ? ' (ya agregado)' : ''}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        {attr.atributoId ? (
                          <Autocomplete
                            options={valuesOptions}
                            getOptionLabel={(option) => option?.valor || ''}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            value={valuesOptions.find((value) => value.id === attr.valorId) || null}
                            onChange={(_event, newValue) => {
                              handleAttributeChange(attr.id, 'valorId', newValue?.id || '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={`Valor ${index + 1}`}
                                placeholder="Busca o selecciona un valor"
                                error={valueError}
                                helperText={valueError ? 'Selecciona el valor.' : undefined}
                              />
                            )}
                            noOptionsText="No hay valores configurados"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Selecciona un atributo primero.
                          </Typography>
                        )}
                      </Grid>

                      <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveAttribute(attr.id)}
                          title="Eliminar este atributo"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}

              {incompleteAttributes && (
                <Typography variant="caption" color="error">
                  Completa o elimina los atributos incompletos antes de guardar.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClose}
          >
            Cancelar
          </Button>

          <Button type="submit" variant="contained" color="primary">
            {isDuplicate ? 'Crear variante similar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
