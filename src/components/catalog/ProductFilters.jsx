// Filtros de catálogo público.

import { Card, CardContent, Typography } from '@mui/material';

export const ProductFilters = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Filtros</Typography>
        <Typography variant="body2" color="text.secondary">Aquí puedes agregar filtros por categoría, color, tamaño y precio.</Typography>
      </CardContent>
    </Card>
  );
};
