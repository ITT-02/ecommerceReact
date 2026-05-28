// Hook para variantes de producto.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVariants,
  getProductsWithVariantsGrouped,
  getVariantAttributeOptions,
  getProductOptions,
  createVariant,
  updateVariant,
  deactivateVariant,
  deleteVariant,
} from '../../services/catalog/variantService';

const normalizePaginatedResponse = (data) => {
  const items = data?.items ?? data?.data ?? (Array.isArray(data) ? data : []);

  return {
    items: Array.isArray(items) ? items : [],
    totalCount:
      data?.totalCount ??
      data?.total_records ??
      data?.[0]?.total_records ??
      (Array.isArray(items) ? items.length : 0),
    totalPages:
      data?.totalPages ??
      data?.total_pages ??
      data?.[0]?.total_pages ??
      1,
    pageNumber: data?.pageNumber ?? data?.page_number ?? 1,
    pageSize: data?.pageSize ?? data?.page_size ?? 10,
  };
};

export const useVariants = ({ page = 1, limit = 10, search = '', productId = null, isActive = null } = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['variants', { page, limit, search, productId, isActive }];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getVariants({ page, limit, search, productId, isActive }),
  });

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
      queryClient.invalidateQueries({ queryKey: ['groupedVariants'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['groupedVariants'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variants'] });
      queryClient.invalidateQueries({ queryKey: ['groupedVariants'] });
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

export const useGroupedVariants = ({
  page = 1,
  limit = 10,
  search = '',
  categoryId = null,
  isActive = null,
  hasVariants = null,
} = {}) => {
  const query = useQuery({
    queryKey: ['groupedVariants', { page, limit, search, categoryId, isActive, hasVariants }],
    queryFn: () => getProductsWithVariantsGrouped({
      page,
      limit,
      search,
      categoryId,
      isActive,
      hasVariants,
    }),
    placeholderData: (previousData) => previousData,
  });

  const normalized = normalizePaginatedResponse(query.data);

  return {
    products: normalized.items,
    pagination: {
      pageNumber: page,
      pageSize: limit,
      totalCount: normalized.totalCount,
      totalPages: normalized.totalPages,
    },
    loading: query.isLoading || query.isFetching,
    error: query.error?.message ?? null,
  };
};

export const useVariantActions = () => {
  const queryClient = useQueryClient();

  const invalidateVariantQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['variants'] });
    queryClient.invalidateQueries({ queryKey: ['groupedVariants'] });
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
  };

  const saveMutation = useMutation({
    mutationFn: ({ payload, id }) => {
      if (id) {
        return updateVariant(id, payload);
      }

      return createVariant(payload);
    },
    onSuccess: invalidateVariantQueries,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => deactivateVariant(id),
    onSuccess: invalidateVariantQueries,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteVariant(id),
    onSuccess: invalidateVariantQueries,
  });

  return {
    saveVariant: (payload, id) => saveMutation.mutateAsync({ payload, id }),
    deactivateVariant: (id) => deactivateMutation.mutateAsync(id),
    removeVariant: (id) => deleteMutation.mutateAsync(id),
    saving: saveMutation.isPending,
    deleting: deleteMutation.isPending,
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
