// Componente para mostrar cuando no hay registros.

import { Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const EmptyState = ({
  title = 'Sin datos',
  description = 'No se encontraron registros.',
  actionLabel = '',
  actionTo = '',
  onAction,
}) => {
  return (
    <Card>
      <CardContent sx={{ textAlign: 'center', py: 5 }}>
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
          {actionLabel && (actionTo || onAction) && (
            <Button
              component={actionTo ? RouterLink : 'button'}
              to={actionTo || undefined}
              onClick={onAction}
              variant="contained"
            >
              {actionLabel}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
