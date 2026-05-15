// Hook para productos base.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deactivateProduct,
  deleteProduct,
  getCategoryOptions,
  getProductById,
  getProducts,
  updateProduct,
} from '../../services/catalog/productService';

const productsQueryKey = ['products'];

export const useProducts = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  categoriaId = null,
  esActivo = null,
  destacado = null,
  requiereCotizacion = null,
} = {}) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: [
      ...productsQueryKey,
      pageNumber,
      pageSize,
      search,
      categoriaId,
      esActivo,
      destacado,
      requiereCotizacion,
    ],
    queryFn: () =>
      getProducts({
        pageNumber,
        pageSize,
        search,
        categoriaId,
        esActivo,
        destacado,
        requiereCotizacion,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, product }) => updateProduct(id, product),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const categoryQuery = useQuery({
    queryKey: ['product-category-options'],
    queryFn: getCategoryOptions,
  });

  return {
    products: productsQuery.data?.items ?? [],
    categories: categoryQuery.data ?? [],
    pagination: {
      totalCount: productsQuery.data?.totalCount ?? 0,
      pageNumber: productsQuery.data?.pageNumber ?? pageNumber,
      pageSize: productsQuery.data?.pageSize ?? pageSize,
      totalPages: productsQuery.data?.totalPages ?? 0,
      hasPreviousPage: productsQuery.data?.hasPreviousPage ?? false,
      hasNextPage: productsQuery.data?.hasNextPage ?? false,
    },
    loading: productsQuery.isLoading,
    fetching: productsQuery.isFetching,
    error:
      productsQuery.error?.message ||
      categoryQuery.error?.message ||
      createMutation.error?.message ||
      updateMutation.error?.message ||
      deleteMutation.error?.message ||
      deactivateMutation.error?.message ||
      null,
    saving: createMutation.isPending || updateMutation.isPending,
    deleting: deleteMutation.isPending || deactivateMutation.isPending,
    getProductById,
    saveProduct: async (product, id = null) => {
      if (id) await updateMutation.mutateAsync({ id, product });
      else await createMutation.mutateAsync(product);
      return true;
    },
    removeProduct: async (product) => {
      await deleteMutation.mutateAsync(product);
      return true;
    },
    deactivateProduct: async (product) => {
      await deactivateMutation.mutateAsync(product);
      return true;
    },
  };
};
