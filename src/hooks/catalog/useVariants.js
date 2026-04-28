// Hook para variantes de producto.

import { useQuery } from '@tanstack/react-query';
import { getVariants } from '../services/variantService';

export const useVariants = (productId = null) => {
  const variantsQuery = useQuery({
    queryKey: ['variants', productId],
    queryFn: () => getVariants(productId),
  });

  return {
    variants: variantsQuery.data ?? [],
    loading: variantsQuery.isLoading,
    error: variantsQuery.error?.message ?? null,
  };
};
