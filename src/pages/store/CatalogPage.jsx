// Página de catálogo público.
// Consume la vista vw_catalogo_publico desde la API externa.

import { Container } from '@mui/material';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PageHeader } from '../../components/common/PageHeader';
import { ProductGrid } from '../../components/catalog/ProductGrid';
import { useCatalog } from '../../hooks/catalog/useCatalog';

export const CatalogPage = () => {
  const { catalog, loading, error } = useCatalog();

  if (loading) return <LoadingScreen message="Cargando catálogo..." />;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader title="Catálogo" description="Productos" />
      <ErrorMessage message={error} />
      {catalog.length === 0 ? <EmptyState title="Sin productos" description="Todavía no hay productos visibles en catálogo." /> : <ProductGrid products={catalog} />}
    </Container>
  );
};
