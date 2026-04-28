// src/components/common/PlaceholderPage.jsx

/**
 * Página base temporal para módulos que todavía no se implementan.
 *
 * También puede usarse como contenedor simple para páginas reales.
 *
 * Uso básico:
 * <PlaceholderPage title="Productos" />
 *
 * Uso con contenido:
 * <PlaceholderPage title="Productos">
 *   <ProductList />
 * </PlaceholderPage>
 */

import { Card, CardContent, Stack, Typography } from '@mui/material';
import { PageHeader } from './PageHeader';

export const PlaceholderPage = ({
  title,
  description = 'Módulo preparado para implementar.',
  children,
}) => {
  return (
    <Stack spacing={3}>
      <PageHeader title={title} description={description} />

      <Card>
          <CardContent>
           {children}
          </CardContent>
      </Card>
    </Stack>
  );
};