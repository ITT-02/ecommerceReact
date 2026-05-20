// Hook para variantes de producto.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getVariants, 
  getVariantAttributeOptions,
  getProductOptions,
  createVariant, 
  updateVariant, 
  deactivateVariant, 
  deleteVariant 
} from '../../services/catalog/variantService';

export const useVariants = ({ page = 1, limit = 10, search = '', productId = null, isActive = null } = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['variants', { page, limit, search, productId, isActive }];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getVariants({ page, limit, search, productId, isActive }),
  });

  // Intentamos extraer los totales y las variantes desde la estructura que devuelve el RPC
  const variantsArray = data?.items ?? data?.variantes ?? data?.data ?? (Array.isArray(data) ? data : []);
  const totalCount = data?.totalCount ?? data?.[0]?.total_records ?? data?.total_records ?? (Array.isArray(variantsArray) ? variantsArray.length : 0);
  const pagesCount = data?.totalPages ?? data?.[0]?.total_pages ?? data?.total_pages ?? 1;

  const saveMutation = useMutation({
    mutationFn: ({ payload, id }) => {
      if (id) {
        return updateVariant(id, payload);
      }
      return createVariant(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
    },
  });

  return {
    variants: Array.isArray(variantsArray) ? variantsArray : [],
    totalRecords: totalCount,
    totalPages: pagesCount,
    loading: isLoading,
    error: error?.message ?? null,
    saveVariant: (payload, id) => saveMutation.mutateAsync({ payload, id }),
    deactivateVariant: (id) => deactivateMutation.mutateAsync(id),
    removeVariant: (id) => deleteMutation.mutateAsync(id),
  };
};

export const useVariantAttributes = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['variantAttributes'],
    queryFn: getVariantAttributeOptions,
  });

  return {
    attributes: data ?? [],
    loading: isLoading,
    error: error?.message ?? null,
  };
};

export const useProductOptions = (search = '') => {
  const query = useQuery({
    queryKey: ['productOptions', search],
    queryFn: () => getProductOptions(search),
    placeholderData: (previousData) => previousData,
  });

  return {
    productOptions: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
  };
};