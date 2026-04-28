// Hook para atributos de catálogo.

import { useQuery } from '@tanstack/react-query';
import { getAttributes } from '../services/attributeService';

export const useAttributes = () => {
  const attributesQuery = useQuery({ 
    queryKey: ['attributes'], 
    queryFn: getAttributes });

  return {
    attributes: attributesQuery.data ?? [],
    loading: attributesQuery.isLoading,
    error: attributesQuery.error?.message ?? null,
  };
};
