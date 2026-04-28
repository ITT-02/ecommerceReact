// Hook para cargar catálogo público.

import { useQuery } from '@tanstack/react-query';
import { getPublicCatalog } from '../../services/catalog/catalogService';

export const useCatalog = () => {
  const catalogQuery = useQuery({
    queryKey: ['catalog'],
    queryFn: getPublicCatalog,
  });

  return {
    catalog: catalogQuery.data ?? [],
    loading: catalogQuery.isLoading,
    error: catalogQuery.error?.message ?? null,
  };
};
