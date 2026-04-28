// Componente para mostrar cuando no hay registros.

import { Card, CardContent, Typography } from '@mui/material';

export const EmptyState = ({ title = 'Sin datos', description = 'No se encontraron registros.' }) => {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 5 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </CardContent>
    </Card>
  );
};
