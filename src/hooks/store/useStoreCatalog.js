import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStoreCatalog,
  getStoreCategories,
  getStoreProductDetail,
} from '../../services/store/storeCatalogService';
import { addItemToCart } from '../../services/sales/cartService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useStoreCatalog = ({
  pageNumber = 1,
  pageSize = 12,
  search = '',
  categoriaId = null,
  destacado = null,
  tipoCompra = null,
  orderBy = 'recientes',
} = {}) => {
  const queryClient = useQueryClient();

  const catalogQuery = useQuery({
    queryKey: ['store-catalog', pageNumber, pageSize, search, categoriaId, destacado, tipoCompra, orderBy],
    queryFn: () => getStoreCatalog({ pageNumber, pageSize, search, categoriaId, destacado, tipoCompra, orderBy }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['store-categories'],
    queryFn: getStoreCategories,
    staleTime: 1000 * 60 * 20,
  });

  const addMutation = useMutation({
    mutationFn: addItemToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['store-catalog'] });
    },
  });

  return {
    products: catalogQuery.data?.items ?? [],
    categories: categoriesQuery.data ?? [],
    pagination: {
      totalCount: catalogQuery.data?.totalCount ?? 0,
      pageNumber: catalogQuery.data?.pageNumber ?? pageNumber,
      pageSize: catalogQuery.data?.pageSize ?? pageSize,
      totalPages: catalogQuery.data?.totalPages ?? 0,
      hasPreviousPage: catalogQuery.data?.hasPreviousPage ?? false,
      hasNextPage: catalogQuery.data?.hasNextPage ?? false,
    },
    loading: catalogQuery.isLoading || categoriesQuery.isLoading,
    fetching: catalogQuery.isFetching,
    error: getErrorMessage(catalogQuery.error) || getErrorMessage(categoriesQuery.error) || getErrorMessage(addMutation.error),
    adding: addMutation.isPending,
    addToCart: async ({ varianteId, cantidad = 1 }) => {
      await addMutation.mutateAsync({ varianteId, cantidad });
      return true;
    },
  };
};

export const useStoreProductDetail = (slug) => {
  const queryClient = useQueryClient();

  const productQuery = useQuery({
    queryKey: ['store-product-detail', slug],
    queryFn: () => getStoreProductDetail(slug),
    enabled: Boolean(slug),
  });

  const addMutation = useMutation({
    mutationFn: addItemToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['store-catalog'] });
    },
  });

  return {
    product: productQuery.data || null,
    loading: productQuery.isLoading,
    fetching: productQuery.isFetching,
    error: getErrorMessage(productQuery.error) || getErrorMessage(addMutation.error),
    adding: addMutation.isPending,
    addToCart: async ({ varianteId, cantidad = 1 }) => {
      await addMutation.mutateAsync({ varianteId, cantidad });
      return true;
    },
  };
};
