// src/pages/admin/inventory/components/MovementForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, TextField, MenuItem, Autocomplete, CircularProgress, Typography, useTheme, alpha
} from '@mui/material';
import { inventoryMovementService } from '../../../../services/inventory/inventoryMovementService';

// ¡ESTA LÍNEA ES LA CLAVE QUE EVITA TU ERROR!
export const MovementForm = ({ open, onClose, onSubmit, isSubmitting }) => {
  const theme = useTheme();
  
  const [formData, setFormData] = useState({
    variante_id: '',
    almacen_id: '',
    tipo_movimiento: '',
    cantidad: '',
    referencia_tipo: '',
    notas: ''
  });

  const [variantesOptions, setVariantesOptions] = useState([]);
  const [almacenOptions, setAlmacenOptions] = useState([]);
  const [loadingVariantes, setLoadingVariantes] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState(null);

  const [varianteInputValue, setVarianteInputValue] = useState('');
  const [almacenInputValue, setAlmacenInputValue] = useState('');

  useEffect(() => {
    const fetchVariantes = async () => {
      setLoadingVariantes(true);
      try {
        const data = await inventoryMovementService.getVariantOptions(varianteInputValue);
        setVariantesOptions(data);
      } catch (err) {
        console.error('Error cargando variantes', err);
      } finally {
        setLoadingVariantes(false);
      }
    };
    
    const timeoutId = setTimeout(() => { fetchVariantes(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [varianteInputValue]);

  useEffect(() => {
    const fetchAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const data = await inventoryMovementService.getWarehouseOptions(almacenInputValue);
        setAlmacenOptions(data);
      } catch (err) {
        console.error('Error cargando almacenes', err);
      } finally {
        setLoadingAlmacenes(false);
      }
    };

    const timeoutId = setTimeout(() => { fetchAlmacenes(); }, 500);
    return () => clearTimeout(timeoutId);
  }, [almacenInputValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.variante_id) return setErrorMsg('Debe seleccionar una variante.');
    if (!formData.almacen_id) return setErrorMsg('Debe seleccionar un almacén.');
    if (Number(formData.cantidad) <= 0) return setErrorMsg('La cantidad debe ser mayor a cero.');

    try {
      await onSubmit(formData);
      onClose(); 
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Ocurrió un error inesperado al registrar el movimiento.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Registrar Movimiento</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>

            {errorMsg && (
              <Box sx={{ 
                p: 1.5, 
                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.error.main, 0.15) : 'error.light', 
                color: theme.palette.mode === 'dark' ? 'error.light' : 'error.contrastText', 
                borderRadius: 1,
                border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                borderColor: 'error.main'
              }}>
                <Typography variant="body2" fontWeight="500">{errorMsg}</Typography>
              </Box>
            )}

            <Autocomplete
              options={variantesOptions}
              getOptionLabel={(opt) => `${opt.producto_nombre}${opt.nombre_variante ? ` - ${opt.nombre_variante}` : ''}${opt.atributos_resumen ? ` (${opt.atributos_resumen})` : ''}`}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={option.id} {...otherProps}>
                    {`${option.producto_nombre}${option.nombre_variante ? ` - ${option.nombre_variante}` : ''}${option.atributos_resumen ? ` (${option.atributos_resumen})` : ''}`}
                  </li>
                );
              }}
              onInputChange={(e, newInputValue) => setVarianteInputValue(newInputValue)}
              onChange={(e, newValue) => setFormData({ ...formData, variante_id: newValue ? newValue.id : '' })}
              loading={loadingVariantes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Variante de Producto"
                  required
                />
              )}
            />

            <Autocomplete
              options={almacenOptions}
              getOptionLabel={(opt) => opt.nombre}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <li key={option.id} {...otherProps}>
                    {option.nombre}
                  </li>
                );
              }}
              onInputChange={(e, newInputValue) => setAlmacenInputValue(newInputValue)}
              onChange={(e, newValue) => setFormData({ ...formData, almacen_id: newValue ? newValue.id : '' })}
              loading={loadingAlmacenes}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Almacén"
                  required
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                fullWidth
                required
                label="Tipo de Movimiento"
                name="tipo_movimiento"
                value={formData.tipo_movimiento}
                onChange={handleChange}
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="salida">Salida</MenuItem>
                <MenuItem value="ajuste">Ajuste (Conteo final)</MenuItem>
                <MenuItem value="reserva">Reserva</MenuItem>
                <MenuItem value="liberacion">Liberación</MenuItem>
              </TextField>

              <TextField
                fullWidth
                required
                type="number"
                label="Cantidad"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                slotProps={{
                  htmlInput: { min: "1", step: "0.01" }
                }}
              />
            </Box>

            <TextField
              select
              fullWidth
              required
              label="Motivo (Referencia)"
              name="referencia_tipo"
              value={formData.referencia_tipo}
              onChange={handleChange}
            >
                <MenuItem value="stock_inicial">Stock inicial</MenuItem>
                <MenuItem value="compra">Compra a Proveedor</MenuItem>
                <MenuItem value="venta_manual">Venta manual</MenuItem>
                <MenuItem value="merma">Merma / Descarte</MenuItem>
                <MenuItem value="conteo_fisico">Conteo físico (Inventariado)</MenuItem>
                <MenuItem value="ajuste_manual">Ajuste manual (Error humano)</MenuItem>
                <MenuItem value="devolucion">Devolución / Reingreso</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notas / Observaciones"
              name="notas"
              value={formData.notas}
              onChange={handleChange}
            />

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, px: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};