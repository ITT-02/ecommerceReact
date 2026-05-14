import { useEffect, useState } from 'react';
import {
  Button,
  Switch, // Cambiado aquí
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  MenuItem,
  TextField,
  Stack,
  Typography
} from '@mui/material';

const TIPOS_DATO = ['texto', 'numero', 'booleano', 'color', 'lista'];

export const AtributoForm = ({ open, isEdit, atributoInicial, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo_dato: 'texto',
    se_usa_en_filtro: true,
    se_usa_en_variantes: true,
    es_obligatorio: false,
  });

  useEffect(() => {
    if (open && atributoInicial) {
      setFormData({
        nombre: atributoInicial.nombre || '',
        tipo_dato: atributoInicial.tipo_dato || 'texto',
        se_usa_en_filtro: atributoInicial.se_usa_en_filtro ?? true,
        se_usa_en_variantes: atributoInicial.se_usa_en_variantes ?? true,
        es_obligatorio: atributoInicial.es_obligatorio ?? false,
      });
    } else if (open) {
      setFormData({
        nombre: '',
        tipo_dato: 'texto',
        se_usa_en_filtro: true,
        se_usa_en_variantes: true,
        es_obligatorio: false,
      });
    }
  }, [open, atributoInicial]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEdit ? 'Editar Atributo' : 'Nuevo Atributo'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              select
              label="Tipo de dato"
              name="tipo_dato"
              value={formData.tipo_dato}
              onChange={handleChange}
              fullWidth
              required
            >
              {TIPOS_DATO.map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: -2 }}>
              Configuraciones del atributo
            </Typography>

            {/* AQUÍ REEMPLAZAMOS LOS CHECKBOXES POR SWITCHES ESCALADOS */}
            <FormGroup sx={{ gap: 1.5, pl: 1 }}>
              <FormControlLabel
                control={<Switch color="success" sx={{ transform: 'scale(1.2)', mr: 1 }} name="se_usa_en_filtro" checked={formData.se_usa_en_filtro} onChange={handleChange} />}
                label="Se usa en filtros"
              />
              <FormControlLabel
                control={<Switch color="success" sx={{ transform: 'scale(1.2)', mr: 1 }} name="se_usa_en_variantes" checked={formData.se_usa_en_variantes} onChange={handleChange} />}
                label="Se usa en variantes"
              />
              <FormControlLabel
                control={<Switch color="warning" sx={{ transform: 'scale(1.2)', mr: 1 }} name="es_obligatorio" checked={formData.es_obligatorio} onChange={handleChange} />}
                label="Es obligatorio"
              />
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained">Guardar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};