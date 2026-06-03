import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStoreActivePromotions,
  getStoreBanners,
  getStoreCatalog,
  getStoreCategories,
  getStoreProductDetail,
} from '../../services/store/storeCatalogService';
import { addItemToCart } from '../../services/sales/cartService';

const EMPTY_ARRAY = Object.freeze([]);

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
  categoriaIds = [],
  destacado = null,
  tipoCompra = null,
  disponibilidad = null,
  personalizable = null,
  precioMin = null,
  precioMax = null,
  orderBy = 'recientes',
} = {}) => {
  const queryClient = useQueryClient();
  const categoriaIdsKey = Array.isArray(categoriaIds) ? categoriaIds.join('|') : '';

  const catalogQuery = useQuery({
    queryKey: [
      'store-catalog',
      pageNumber,
      pageSize,
      search,
      categoriaId,
      categoriaIdsKey,
      destacado,
      tipoCompra,
      disponibilidad,
      personalizable,
      precioMin,
      precioMax,
      orderBy,
    ],
    placeholderData: keepPreviousData,
    queryFn: () =>
      getStoreCatalog({
        pageNumber,
        pageSize,
        search,
        categoriaId,
        categoriaIds,
        destacado,
        tipoCompra,
        disponibilidad,
        personalizable,
        precioMin,
        precioMax,
        orderBy,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['store-categories'],
    queryFn: getStoreCategories,
    staleTime: 1000 * 60 * 20,
  });

  const bannersQuery = useQuery({
    queryKey: ['store-banners-public'],
    queryFn: getStoreBanners,
    staleTime: 1000 * 60 * 10,
  });

  const promotionsQuery = useQuery({
    queryKey: ['store-promotions-public'],
    queryFn: () => getStoreActivePromotions({ limit: 6 }),
    staleTime: 1000 * 60 * 10,
  });

  const addMutation = useMutation({
    mutationFn: addItemToCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['store-catalog'] });
    },
  });

  return {
    products: catalogQuery.data?.items ?? EMPTY_ARRAY,
    categories: categoriesQuery.data ?? EMPTY_ARRAY,
    banners: bannersQuery.data ?? EMPTY_ARRAY,
    promotions: promotionsQuery.data ?? EMPTY_ARRAY,
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
    error:
      getErrorMessage(catalogQuery.error) ||
      getErrorMessage(categoriesQuery.error) ||
      getErrorMessage(bannersQuery.error) ||
      getErrorMessage(promotionsQuery.error) ||
      getErrorMessage(addMutation.error),
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
