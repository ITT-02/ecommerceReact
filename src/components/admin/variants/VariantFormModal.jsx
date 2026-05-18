import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Grid, Stack, IconButton, Typography, Autocomplete,
  FormControlLabel, Switch, Divider, MenuItem, InputAdornment, Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useProductOptions } from '../../../hooks/catalog/useProducts';
import { useVariantAttributes } from '../../../hooks/catalog/useVariants';

export const VariantFormModal = ({ open, variant = null, onClose, onSave }) => {
  const isEditing = !!variant;
  
  // States
  const [productSearch, setProductSearch] = useState('');
  const { productOptions, loading: productsLoading } = useProductOptions(productSearch);
  const { attributes: allowedAttributes, loading: attributesLoading } = useVariantAttributes();

  const [formData, setFormData] = useState({
    producto_id: null, // Guardará un objeto { id, nombre }
    codigo_referencia: '',
    nombre_variante: '',
    medida_largo: '',
    medida_ancho: '',
    medida_alto: '',
    unidad_medida: 'cm',
    etiqueta_medida: '',
    peso_gramos: '',
    precio: '',
    precio_comparacion: '',
    costo: '',
    stock_minimo: 5,
    es_predeterminada: false,
    es_activa: true
  });

  const [dynamicAttributes, setDynamicAttributes] = useState([]); // Array de { id_uuid_temporal, atributoId, valorId }

  useEffect(() => {
    if (open) {
      if (isEditing) {
        // Hydrate from variant (would need exact mappings if editing, keeping simple for now)
        setFormData({
          producto_id: variant.producto_id ? { id: variant.producto_id, nombre: variant.producto_nombre || variant.productos?.nombre || 'Producto Mantenido' } : null,
          codigo_referencia: variant.codigo_referencia || '',
          nombre_variante: variant.nombre_variante || '',
          medida_largo: variant.medida_largo || '',
          medida_ancho: variant.medida_ancho || '',
          medida_alto: variant.medida_alto || '',
          unidad_medida: ['cm', 'mm'].includes(variant.unidad_medida) ? variant.unidad_medida : 'cm',
          etiqueta_medida: variant.etiqueta_medida || '',
          peso_gramos: variant.peso_gramos || '',
          precio: variant.precio || '',
          precio_comparacion: variant.precio_comparacion || '',
          costo: variant.costo || '',
          stock_minimo: variant.stock_minimo ?? 5,
          es_predeterminada: variant.es_predeterminada || false,
          es_activa: variant.es_activa ?? true
        });
        
        let loadedAttributes = [];
        const generateId = () => window.crypto?.randomUUID?.() || Math.random().toString(36).substring(2);
        const attrsList = variant.atributos || variant.producto_variante_atributos || [];
        if (Array.isArray(attrsList)) {
          loadedAttributes = attrsList.map(a => ({
            id: generateId(), 
            atributoId: a.atributo_id || a.atributo_valor?.atributo_id || '',
            valorId: a.atributo_valor_id || a.id || ''
          }));
        }
        
        setDynamicAttributes(loadedAttributes);
      } else {
        // Reset
        setFormData({
          producto_id: null, codigo_referencia: '', nombre_variante: '', medida_largo: '', medida_ancho: '',
          medida_alto: '', unidad_medida: 'cm', etiqueta_medida: '', peso_gramos: '', precio: '',
          precio_comparacion: '', costo: '', stock_minimo: 5, es_predeterminada: false, es_activa: true
        });
        setDynamicAttributes([]);
      }
    }
  }, [open, variant, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Evitar que se ingresen números negativos
    if (type === 'number' && Number(value) < 0) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddAttribute = () => {
    const generateId = () => window.crypto?.randomUUID?.() || Math.random().toString(36).substring(2);
    setDynamicAttributes(prev => [...prev, { id: generateId(), atributoId: '', valorId: '' }]);
  };

  const handleRemoveAttribute = (id) => {
    setDynamicAttributes(prev => prev.filter(attr => attr.id !== id));
  };

  const handleAttributeChange = (id, field, value) => {
    setDynamicAttributes(prev => prev.map(attr => {
      if (attr.id === id) {
        return { ...attr, [field]: value, ...(field === 'atributoId' ? { valorId: '' } : {}) };
      }
      return attr;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare payload
    const payload = {
      variant: {
        producto_id: formData.producto_id?.id || null,
        codigo_referencia: formData.codigo_referencia.trim() || null,
        nombre_variante: formData.nombre_variante.trim() || null,
        medida_largo: formData.medida_largo ? Number(formData.medida_largo) : null,
        medida_ancho: formData.medida_ancho ? Number(formData.medida_ancho) : null,
        medida_alto: formData.medida_alto ? Number(formData.medida_alto) : null,
        unidad_medida: formData.unidad_medida || 'cm',
        etiqueta_medida: formData.etiqueta_medida.trim() || null,
        peso_gramos: formData.peso_gramos ? Number(formData.peso_gramos) : null,
        precio: Number(formData.precio || 0),
        precio_comparacion: formData.precio_comparacion ? Number(formData.precio_comparacion) : null,
        costo: formData.costo ? Number(formData.costo) : null,
        stock_minimo: Number(formData.stock_minimo || 5),
        es_predeterminada: formData.es_predeterminada,
        es_activa: formData.es_activa,
      },
      attributes: dynamicAttributes.filter(a => a.valorId).map(a => ({ atributo_valor_id: a.valorId }))
    };

    onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditing ? 'Editar Variante' : 'Nueva Variante'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Producto y Básico */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={productOptions}
                getOptionLabel={(option) => option.nombre}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={productsLoading}
                onInputChange={(e, newInputValue) => setProductSearch(newInputValue)}
                value={formData.producto_id}
                onChange={(e, newValue) => setFormData(p => ({ ...p, producto_id: newValue }))}
                renderInput={(params) => (
                  <TextField {...params} label="Producto *" required size="small" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth label="Nombre / Título Variante *" name="nombre_variante"
                value={formData.nombre_variante} onChange={handleChange} size="small"
                placeholder="Ej: Caja e-commerce 30x30x10 Kraft" required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth label="Código Serie/SKU" name="codigo_referencia"
                value={formData.codigo_referencia} onChange={handleChange} size="small"
              />
            </Grid>

            {/* Medidas */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Medidas (opcional)</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField fullWidth label="Largo" name="medida_largo" type="number" size="small" value={formData.medida_largo} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField fullWidth label="Ancho" name="medida_ancho" type="number" size="small" value={formData.medida_ancho} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField fullWidth label="Alto" name="medida_alto" type="number" size="small" value={formData.medida_alto} onChange={handleChange} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField select fullWidth label="U. Medida" name="unidad_medida" size="small" value={formData.unidad_medida} onChange={handleChange}>
                    <MenuItem value="cm">cm</MenuItem>
                    <MenuItem value="mm">mm</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Etiqueta visible (Ej: 30x30x10 cm)" name="etiqueta_medida" value={formData.etiqueta_medida} onChange={handleChange} size="small" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Peso (Gramos)" name="peso_gramos" type="number" value={formData.peso_gramos} onChange={handleChange} size="small" />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            {/* Precios e Inventario */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Precio de venta" name="precio" type="number" required
                value={formData.precio} onChange={handleChange} size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">S/</InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Precio comparativo" name="precio_comparacion" type="number"
                value={formData.precio_comparacion} onChange={handleChange} size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">S/</InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Costo" name="costo" type="number"
                value={formData.costo} onChange={handleChange} size="small"
                slotProps={{ input: { startAdornment: <InputAdornment position="start">S/</InputAdornment> } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth label="Stock Mínimo" name="stock_minimo" type="number" required
                value={formData.stock_minimo} onChange={handleChange} size="small" />
            </Grid>

            {/* Estados */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <Stack direction="row" spacing={3} sx={{ height: '100%', alignItems: 'center' }}>
                <FormControlLabel control={<Switch checked={formData.es_predeterminada} onChange={handleChange} name="es_predeterminada" />} label="Por Defecto" />
                
                <FormControlLabel 
                  control={<Switch checked={formData.es_activa} onChange={handleChange} name="es_activa" color="primary" />} 
                  label={formData.es_activa ? "Estado Activo" : "Estado Inactivo"} 
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">Atributos Dinámicos</Typography>
                <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddAttribute}>Agregar Atributo</Button>
              </Stack>
              
              {dynamicAttributes.length === 0 && (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">Sin atributos adicionales. Puedes agregarlos para que el cliente seleccione opciones (Ej: Color: Rojo).</Typography>
              )}

              {dynamicAttributes.map((attr, index) => {
                const safeAttributes = Array.isArray(allowedAttributes) ? allowedAttributes : [];
                const selectedAttributeDef = safeAttributes.find(a => a.id === attr.atributoId);
                const valuesOptions = Array.isArray(selectedAttributeDef?.valores) ? selectedAttributeDef.valores : [];

                return (
                  <Box 
                    key={attr.id} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: 2, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      backgroundColor: 'background.default'
                    }}
                  >
                    <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField 
                          select 
                          label={`Atributo ${index + 1}`} 
                          size="small" 
                          fullWidth
                          value={attr.atributoId || ''} 
                          onChange={(e) => handleAttributeChange(attr.id, 'atributoId', e.target.value)}
                        >
                          <MenuItem value="" disabled>Seleccione un atributo</MenuItem>
                          {safeAttributes.map(a => (
                            <MenuItem key={a.id || Math.random()} value={a.id || ''}>{a.nombre}</MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      
                      <Grid size={{ xs: 12, sm: 6 }}>
                        {attr.atributoId ? (
                          <Autocomplete
                            options={valuesOptions}
                            getOptionLabel={(option) => option.valor || ''}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            value={valuesOptions.find(v => v.id === attr.valorId) || null}
                            onChange={(e, newValue) => handleAttributeChange(attr.id, 'valorId', newValue ? newValue.id : '')}
                            renderInput={(params) => (
                              <TextField 
                                {...params} 
                                label={`Valor ${index + 1}`} 
                                size="small" 
                                placeholder="Busca o selecciona un valor..." 
                              />
                            )}
                            noOptionsText="No hay valores configurados"
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            ← Selecciona un atributo primero.
                          </Typography>
                        )}
                      </Grid>

                      <Grid size={{ xs: 12, sm: 1 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton color="error" onClick={() => handleRemoveAttribute(attr.id)} title="Eliminar este atributo">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                );
              })}
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};