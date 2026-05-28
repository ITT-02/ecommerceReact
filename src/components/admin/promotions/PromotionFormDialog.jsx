import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { mapPromotionToFormData, mapFormDataToPayload } from '../../../adapters/promotionsMapper';
import { getCategoriesForPromotion } from '../../../services/catalog/categoryService';
import { getProductsForPromotion } from '../../../services/catalog/productService';
import { getVariantsForPromotion } from '../../../services/catalog/variantService';

export const PromotionFormDialog = ({ open, onClose, onSave, promotion, loading, mode = 'create' }) => {
  const isEditMode = mode === 'edit';
  const isViewMode = mode === 'view';
  const [formData, setFormData] = useState(() => mapPromotionToFormData(promotion));
  const [selectedApplications, setSelectedApplications] = useState([]);

  // Estados para datos del backend
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading_categories, setLoadingCategories] = useState(false);
  const [loading_products, setLoadingProducts] = useState(false);
  const [loading_variants, setLoadingVariants] = useState(false);

  // Cargar categorías, productos y variantes cuando se abre el dialog
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoadingCategories(true);
        const cats = await getCategoriesForPromotion();
        setCategories(cats || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }

      try {
        setLoadingProducts(true);
        const prods = await getProductsForPromotion();
        setProducts(prods || []);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }

      try {
        setLoadingVariants(true);
        const vars = await getVariantsForPromotion();
        setVariants(vars || []);
      } catch (error) {
        console.error('Error loading variants:', error);
        setVariants([]);
      } finally {
        setLoadingVariants(false);
      }
    };

    loadData();
  }, [open]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Resetear selecciones cuando cambia aplica_a
    if (name === 'aplica_a') {
      setSelectedApplications([]);
    }
  };

  const handleApplicationsChange = (event, value) => {
    // Mapear cada selección al formato correcto: {target_tipo, target_id}
    const mapped = value.map((item) => ({
      target_tipo: formData.aplica_a,
      target_id: item.id,
    }));
    setSelectedApplications(mapped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    const payload = mapFormDataToPayload(formData, selectedApplications);
    await onSave(payload, promotion?.id || null);
    onClose();
  };

  const isCupon = formData.tipo_promocion === 'cupon';
  const isEnvioGratis = formData.tipo_promocion === 'envio_gratis' || formData.tipo_descuento === 'envio_gratis';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md" // Ideal para acomodar dos columnas de inputs cómodamente
      slotProps={{
        paper : {
          sx: {
            borderRadius: (theme) => `${theme.palette.custom.radius.xxl}px`,
            bgcolor: 'background.paper',
            p: 1,
          },
        }
      }}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* CABECERA */}
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box
          component="span"
          sx={{
            typography: 'h5',
            fontWeight: '700',
            color: 'text.primary',
          }}
        >
          {isViewMode ? 'Detalles de Promoción' : isEditMode ? 'Editar Promoción' : 'Crear Promoción'}
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
          <CloseIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </DialogTitle>

      {/* CUERPO DEL FORMULARIO */}
      <DialogContent dividers sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          
          {/* Nombre */}
          <Grid size={{ xs: 12, md: 6}}>
            <TextField
              required
              label="Nombre de la promoción"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={isViewMode}
            />
          </Grid>

          {/* Descripción */}
          <Grid size={{ xs: 12 }}>
            <TextField
              multiline
              rows={2}
              label="Descripción (Opcional)"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={isViewMode}
            />
          </Grid>

          {/* Tipo de Descuento */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Tipo de descuento"
              name="tipo_descuento"
              value={formData.tipo_descuento}
              onChange={handleChange}
              disabled={isViewMode}
            >
              <MenuItem value="porcentaje">Porcentaje (%)</MenuItem>
              <MenuItem value="monto_fijo">Monto Fijo</MenuItem>
              <MenuItem value="envio_gratis">Envío Gratis</MenuItem>
            </TextField>
          </Grid>

          {/* Valor Descuento (Se pone en 0 y se bloquea si es envío gratis) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              type="number"
              label="Valor descuento"
              name="valor_descuento"
              disabled={isViewMode || isEnvioGratis}
              value={isEnvioGratis ? 0 : formData.valor_descuento}
              onChange={handleChange}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>

          {/* Tipo de Promoción */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Tipo de promoción"
              name="tipo_promocion"
              value={formData.tipo_promocion}
              onChange={handleChange}
              disabled={isViewMode}
            >
              <MenuItem value="descuento_directo">Descuento Directo</MenuItem>
              <MenuItem value="cupon">Cupón</MenuItem>
              <MenuItem value="envio_gratis">Envío Gratis</MenuItem>
            </TextField>
          </Grid>

          {/* Código Cupón (Obligatorio solo si tipo_promocion === 'cupon') */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required={isCupon}
              disabled={isViewMode || !isCupon}
              label="Código cupón"
              name="codigo"
              value={isCupon ? formData.codigo : ''}
              onChange={handleChange}
              placeholder={isCupon ? "EJ: BIENVENIDA10" : "Solo para cupones"}
            />
          </Grid>

          {/* Prioridad */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              type="number"
              label="Prioridad (Mayor valor gana prioridad)"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
              disabled={isViewMode}
            />
          </Grid>

          <Box sx={{ width: '100%', display: { xs: 'none', sm: 'block' } }} />

          {/* Fecha Inicio */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="datetime-local"
              label="Fecha inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={isViewMode}
            />
          </Grid>

          {/* Fecha Fin */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="datetime-local"
              label="Fecha fin"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={isViewMode}
            />
          </Grid>

          {/* Monto Mínimo Pedido */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label="Monto mínimo pedido"
              name="monto_minimo_pedido"
              value={formData.monto_minimo_pedido}
              onChange={handleChange}
              disabled={isViewMode}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>

          {/* Uso Máximo */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label="Uso máximo total (o null)"
              name="uso_maximo"
              value={formData.uso_maximo}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="Ilimitado"
            />
          </Grid>

          {/* Uso Por Cliente */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              type="number"
              label="Uso máximo por cliente"
              name="uso_por_cliente"
              value={formData.uso_por_cliente}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="Ilimitado"
            />
          </Grid>

          {/* Aplica A */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Aplica a"
              name="aplica_a"
              value={formData.aplica_a}
              disabled={isViewMode}
              onChange={handleChange}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="categoria">Categoría</MenuItem>
              <MenuItem value="producto">Producto</MenuItem>
              <MenuItem value="variante">Variante</MenuItem>
            </TextField>
          </Grid>

          {/* Estado Activa / Inactiva */}
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.es_activa}
                  onChange={handleChange}
                  name="es_activa"
                  color="success"
                  disabled={isViewMode}
                />
              }
              label={
                <Typography sx={{ fontWeight: 'bold' }}>
                  {formData.es_activa ? 'La promoción iniciará activa' : 'La promoción estará inactiva'}
                </Typography>
              }
            />
          </Grid>

          {/* Elegir aplicaciones */}
          {formData.aplica_a === 'categoria' && (
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                disabled={isViewMode}
                options={categories}
                getOptionLabel={(option) => option.nombre || ''}
                value={selectedApplications.map((app) => categories.find((c) => c.id === app.target_id)) || []}
                onChange={handleApplicationsChange}
                loading={loading_categories}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar Categorías"
                    placeholder="Buscar categorías..."
                  />
                )}
              />
            </Grid>
          )}

          {formData.aplica_a === 'producto' && (
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                disabled={isViewMode}
                options={products}
                getOptionLabel={(option) => option.nombre || ''}
                value={selectedApplications.map((app) => products.find((p) => p.id === app.target_id)) || []}
                onChange={handleApplicationsChange}
                loading={loading_products}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar Productos"
                    placeholder="Buscar productos..."
                  />
                )}
              />
            </Grid>
          )}

          {formData.aplica_a === 'variante' && (
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                multiple
                disabled={isViewMode}
                options={variants}
                getOptionLabel={(option) => `${option.producto_nombre || ''} - ${option.nombre_variante || ''} ${option.atributos_resumen ? `(${option.atributos_resumen})` : ''}`}
                value={selectedApplications.map((app) => variants.find((v) => v.id === app.target_id)) || []}
                onChange={handleApplicationsChange}
                loading={loading_variants}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleccionar Variantes"
                    placeholder="Buscar variantes..."
                  />
                )}
              />
            </Grid>
          )}

        </Grid>
      </DialogContent>

      {/* PIE DE DIALOG - BOTONES */}
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant={isViewMode ? 'contained' : 'outlined'}
          color={isViewMode ? 'primary' : 'secondary'}
          disabled={loading}
          sx={{
            borderRadius: (theme) => `${theme.palette.custom.radius.md}px`,
            px: 4,
            py: 1.2
          }}
        >
          {isViewMode ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!isViewMode && (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              borderRadius: (theme) => `${theme.palette.custom.radius.md}px`,
              px: 4,
              py: 1.2,
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Crear Promoción'}
          </Button>
        )}
      </DialogActions>
      </Box>
    </Dialog>
  );
};