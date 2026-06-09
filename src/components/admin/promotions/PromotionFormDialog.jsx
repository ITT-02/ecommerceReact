import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { mapFormDataToPayload, mapPromotionToFormData } from '../../../adapters/promotionsMapper';
import { AdminDialog } from '../../common/adminDialog/AdminDialog';
import { ErrorMessage } from '../../common/ErrorMessage';
import { getCategoriesForPromotion } from '../../../services/catalog/categoryService';
import { getProductsForPromotion } from '../../../services/catalog/productService';
import { getVariantsForPromotion } from '../../../services/catalog/variantService';
import { AppDatePicker } from '../../common/AppDatePicker';

const getApplicationOptionLabel = (option) => {
  if (!option) return '';

  const productName = option.producto_nombre || option.producto || '';
  const variantName = option.nombre_variante || option.variante || '';
  const attributes = option.atributos_resumen ? ` (${option.atributos_resumen})` : '';

  if (productName || variantName) {
    return `${productName}${variantName ? ` - ${variantName}` : ''}${attributes}`.trim();
  }

  return option.nombre || option.target_nombre || '';
};

const isValidDateRange = (start, end) => {
  if (!start || !end) return true;
  return new Date(end).getTime() >= new Date(start).getTime();
};

const blurActiveElement = () => {
  if (typeof document === 'undefined') return;

  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

export const PromotionFormDialog = ({
  open,
  onClose,
  onSave,
  promotion,
  loading,
  error,
  mode = 'create',
}) => {
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';

  const [formData, setFormData] = useState(() => mapPromotionToFormData(promotion));
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [localError, setLocalError] = useState('');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(mapPromotionToFormData(promotion));
    setSelectedApplications(
      (promotion?.aplicaciones || []).map((item) => ({
        target_tipo: item.target_tipo,
        target_id: item.target_id,
      }))
    );
    setLocalError('');
  }, [open, promotion]);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoadingCategories(true);
        const cats = await getCategoriesForPromotion();
        setCategories(cats || []);
      } catch (loadError) {
        console.error('Error al cargar categorías para promociones:', loadError);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }

      try {
        setLoadingProducts(true);
        const prods = await getProductsForPromotion();
        setProducts(prods || []);
      } catch (loadError) {
        console.error('Error al cargar productos para promociones:', loadError);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }

      try {
        setLoadingVariants(true);
        const vars = await getVariantsForPromotion();
        setVariants(vars || []);
      } catch (loadError) {
        console.error('Error al cargar variantes para promociones:', loadError);
        setVariants([]);
      } finally {
        setLoadingVariants(false);
      }
    };

    loadData();
  }, [open]);

  const applicationOptions = useMemo(() => {
    if (formData.aplica_a === 'categoria') return categories;
    if (formData.aplica_a === 'producto') return products;
    if (formData.aplica_a === 'variante') return variants;
    return [];
  }, [categories, formData.aplica_a, products, variants]);

  const selectedApplicationOptions = useMemo(() => {
    return selectedApplications
      .map((app) => applicationOptions.find((option) => option.id === app.target_id))
      .filter(Boolean);
  }, [applicationOptions, selectedApplications]);

  const applicationsLoading =
    formData.aplica_a === 'categoria'
      ? loadingCategories
      : formData.aplica_a === 'producto'
        ? loadingProducts
        : formData.aplica_a === 'variante'
          ? loadingVariants
          : false;

  const isCoupon = formData.tipo_promocion === 'cupon';
  const isFreeShipping = formData.tipo_promocion === 'envio_gratis';

  const updateField = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'tipo_promocion') {
        if (value === 'envio_gratis') {
          next.tipo_descuento = 'envio_gratis';
          next.valor_descuento = 0;
          next.codigo = '';
        } else {
          if (prev.tipo_descuento === 'envio_gratis') {
            next.tipo_descuento = 'porcentaje';
            next.valor_descuento = '';
          }

          if (value !== 'cupon') {
            next.codigo = '';
          }
        }
      }

      if (name === 'aplica_a') {
        setSelectedApplications([]);
      }

      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    updateField(name, type === 'checkbox' ? checked : value);
  };

  const handleApplicationsChange = (_, value) => {
    setSelectedApplications(
      value.map((item) => ({
        target_tipo: formData.aplica_a,
        target_id: item.id,
      }))
    );
  };

  const validateForm = () => {
    if (!formData.nombre?.trim()) {
      return 'Debe ingresar el nombre de la promoción.';
    }

    if (isCoupon && !formData.codigo?.trim()) {
      return 'Debe ingresar el código del cupón.';
    }

    if (!isFreeShipping && Number(formData.valor_descuento || 0) <= 0) {
      return 'Debe ingresar un valor de descuento mayor a cero.';
    }

    if (!isValidDateRange(formData.fecha_inicio, formData.fecha_fin)) {
      return 'La fecha fin no puede ser menor que la fecha inicio.';
    }

    if (formData.aplica_a !== 'todos' && selectedApplications.length === 0) {
      return 'Debe seleccionar al menos una categoría, producto o variante.';
    }

    return '';
  };

  const handleDialogClose = (event, reason) => {
    blurActiveElement();

    window.requestAnimationFrame(() => {
      onClose?.(event, reason);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault?.();

    blurActiveElement();

    if (isViewMode) return;

    const validationMessage = validateForm();

    if (validationMessage) {
      setLocalError(validationMessage);
      return;
    }

    setLocalError('');

    const payload = mapFormDataToPayload(formData, selectedApplications);

    await onSave(payload, promotion?.id || null);
  };

  const dialogTitle = isViewMode
    ? 'Detalle de promoción'
    : isEditMode
      ? 'Editar promoción'
      : 'Nueva promoción';

  return (
    <AdminDialog
      open={open}
      onClose={handleDialogClose}
      title={dialogTitle}
      maxWidth="md"
      loading={loading}
      actions={
        <>
          <Button
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleDialogClose}
            variant={isViewMode ? 'contained' : 'outlined'}
            disabled={loading}
          >
            {isViewMode ? 'Cerrar' : 'Cancelar'}
          </Button>

          {!isViewMode && (
            <Button
              variant="contained"
              color="primary"
              disabled={loading}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleSubmit}
            >
              {loading ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Crear promoción'}
            </Button>
          )}
        </>
      }
    >
      <Stack spacing={2}>
        <ErrorMessage message={localError || error} />

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              required
              label="Nombre de la promoción"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              label="Tipo de promoción"
              name="tipo_promocion"
              value={formData.tipo_promocion}
              onChange={handleChange}
              disabled={isViewMode}
            >
              <MenuItem value="descuento_directo">Descuento directo</MenuItem>
              <MenuItem value="cupon">Cupón</MenuItem>
              <MenuItem value="envio_gratis">Envío gratis</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              multiline
              minRows={2}
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={isViewMode}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Tipo de descuento"
              name="tipo_descuento"
              value={isFreeShipping ? 'envio_gratis' : formData.tipo_descuento}
              onChange={handleChange}
              disabled={isViewMode || isFreeShipping}
              helperText={isFreeShipping ? 'El envío gratis no requiere valor de descuento.' : ''}
            >
              {!isFreeShipping && <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>}
              {!isFreeShipping && <MenuItem value="monto_fijo">Monto fijo</MenuItem>}
              {isFreeShipping && <MenuItem value="envio_gratis">Envío gratis</MenuItem>}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required={!isFreeShipping}
              type="number"
              label="Valor descuento"
              name="valor_descuento"
              disabled={isViewMode || isFreeShipping}
              value={isFreeShipping ? 0 : formData.valor_descuento}
              onChange={handleChange}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required={isCoupon}
              disabled={isViewMode || !isCoupon}
              label="Código cupón"
              name="codigo"
              value={isCoupon ? formData.codigo : ''}
              onChange={handleChange}
              placeholder={isCoupon ? 'Ingrese codigo cupón' : 'Solo para cupones'}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="number"
              label="Prioridad"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              disabled={isViewMode}
              helperText="Si hay varias promociones, la de mayor prioridad se evalúa primero."
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <AppDatePicker
              label="Fecha inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={updateField}
              disabled={isViewMode}
              withTime
              width="100%"
              size="small"
              actionBarActions={['cancel', 'accept']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <AppDatePicker
              label="Fecha fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={updateField}
              disabled={isViewMode}
              withTime
              width="100%"
              size="small"
              minDate={formData.fecha_inicio || null}
              actionBarActions={['cancel', 'accept']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label="Monto mínimo pedido"
              name="monto_minimo_pedido"
              value={formData.monto_minimo_pedido}
              onChange={handleChange}
              disabled={isViewMode}
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label="Uso máximo total"
              name="uso_maximo"
              value={formData.uso_maximo}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="Ilimitado"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label="Uso máximo por cliente"
              name="uso_por_cliente"
              value={formData.uso_por_cliente}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="Ilimitado"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Aplica a"
              name="aplica_a"
              value={formData.aplica_a}
              disabled={isViewMode}
              onChange={handleChange}
            >
              <MenuItem value="todos">Todo el catálogo</MenuItem>
              <MenuItem value="categoria">Categorías específicas</MenuItem>
              <MenuItem value="producto">Productos específicos</MenuItem>
              <MenuItem value="variante">Variantes específicas</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box
              sx={(theme) => ({
                px: 2,
                py: 1.25,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                minHeight: 56,
              })}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                  Estado operativo
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formData.es_activa ? 'Activa para ser evaluada en tienda.' : 'Inactiva temporalmente.'}
                </Typography>
              </Box>

              <Switch
                checked={Boolean(formData.es_activa)}
                onChange={(event) => updateField('es_activa', event.target.checked)}
                color="primary"
                disabled={isViewMode}
                slotProps={{
                  input: {
                    'aria-label': 'Cambiar estado de la promoción',
                  },
                }}
              />
            </Box>
          </Grid>

          {formData.aplica_a !== 'todos' && (
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                disabled={isViewMode}
                options={applicationOptions}
                value={selectedApplicationOptions}
                onChange={handleApplicationsChange}
                loading={applicationsLoading}
                getOptionLabel={getApplicationOptionLabel}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar aplicaciones"
                    placeholder="Buscar y seleccionar..."
                    slotProps={{
                      ...params.slotProps,
                      input: {
                        ...params.slotProps?.input,
                        endAdornment: (
                          <>
                            {applicationsLoading ? <CircularProgress color="inherit" size={18} /> : null}
                            {params.slotProps?.input?.endAdornment}
                          </>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>
          )}
        </Grid>
      </Stack>
    </AdminDialog>
  );
};
