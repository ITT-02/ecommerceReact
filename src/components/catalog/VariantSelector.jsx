// Selector de variantes como color o tamaño.

import { MenuItem, TextField } from '@mui/material';

export const VariantSelector = ({ variants = [], value, onChange }) => {
  return (
    <TextField select label="Variante" value={value} onChange={onChange}>
      {variants.map((variant) => (
        <MenuItem key={variant.variante_id || variant.id} value={variant.variante_id || variant.id}>
          {variant.nombre_variante || variant.etiqueta_medida || variant.codigoProducto}
        </MenuItem>
      ))}
    </TextField>
  );
};
