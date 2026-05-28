// Contenedor base reutilizable para páginas con encabezado y superficie principal.

import { Card, CardContent, Stack } from '@mui/material';
import { PageHeader } from './PageHeader';

export const PlaceholderPage = ({
  title,
  description = 'Gestiona la información del módulo.',
  children,
}) => {
  return (
    <Stack spacing={2.5}>
      <PageHeader title={title} description={description} />

      <Card>
        <CardContent>{children}</CardContent>
      </Card>
    </Stack>
  );
};
