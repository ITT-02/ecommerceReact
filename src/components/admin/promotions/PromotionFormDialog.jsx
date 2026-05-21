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
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { initialPromotionFormData, mapPromotionToFormData, mapFormDataToPayload } from '../../../adapters/promotionsMapper';

export const PromotionFormDialog = ({ open, onClose, onSave, promotion, loading }) => {
  const isEditMode = Boolean(promotion?.id);
  const [formData, setFormData] = useState(initialPromotionFormData);

  // Cada vez que se abra con una promoción o se limpie, inicializamos el formulario
  useEffect(() => {
    if (open) {
        setFormData(mapPromotionToFormData(promotion));
    } else {
        setFormData(initialPromotionFormData);
    }
}, [open, promotion]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Inyectamos un arreglo vacío de aplicaciones por defecto (modificar si agregas selector de categorías/productos)
    const payload = mapFormDataToPayload(formData, []);
    
    // Ejecutamos el guardado pasando el id si estamos editando
    await onSave(payload, promotion?.id || null);
    onClose();
  };

  // Lógica de deshabilitación dinámica basada en las reglas que me pasaste
  const isCupon = formData.tipo_promocion === 'cupon';
  const isEnvioGratis = formData.tipo_promocion === 'envio_gratis' || formData.tipo_descuento === 'envio_gratis';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md" // Ideal para acomodar dos columnas de inputs cómodamente
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
        sx: {
          borderRadius: (theme) => `${theme.palette.custom.radius.xxl}px`,
          bgcolor: 'background.paper',
          p: 1,
        },
      }}
    >
      {/* CABECERA */}
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          {isEditMode ? 'Editar Promoción' : 'Crear Promoción'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
          <CloseIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </DialogTitle>

      {/* CUERPO DEL FORMULARIO */}
      <DialogContent dividers sx={{ borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          
          {/* Nombre */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required
              label="Nombre de la promoción"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
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
            >
              <MenuItem value="descuento_directo">Descuento Directo</MenuItem>
              <MenuItem value="cupon">Cupón</MenuItem>
              <MenuItem value="envio_gratis">Envío Gratis</MenuItem>
            </TextField>
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
              disabled={isEnvioGratis}
              value={isEnvioGratis ? 0 : formData.valor_descuento}
              onChange={handleChange}
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>

          {/* Código Cupón (Obligatorio solo si tipo_promocion === 'cupon') */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              required={isCupon}
              disabled={!isCupon}
              label="Código cupón"
              name="codigo"
              value={isCupon ? formData.codigo : ''}
              onChange={handleChange}
              placeholder={isCupon ? "EJ: BIENVENIDA10" : "Solo para cupones"}
            />
          </Grid>

          {/* Prioridad */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="number"
              label="Prioridad (Mayor valor gana prioridad)"
              name="prioridad"
              value={formData.prioridad}
              onChange={handleChange}
            />
          </Grid>

          {/* Fecha Inicio */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              type="datetime-local"
              label="Fecha inicio"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              slotProps={{ inputLabel: { shrink: true } }}
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
                />
              }
              label={
                <Typography sx={{ fontWeight: 'bold' }}>
                  {formData.es_activa ? 'La promoción iniciará activa' : 'La promoción estará inactiva'}
                </Typography>
              }
            />
          </Grid>

        </Grid>
      </DialogContent>

      {/* PIE DE DIALOG - BOTONES */}
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          disabled={loading}
          sx={{
            borderRadius: (theme) => `${theme.palette.custom.radius.md}px`,
            px: 4,
            py: 1.2
          }}
        >
          Cancelar
        </Button>
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
      </DialogActions>
    </Dialog>
  );
};