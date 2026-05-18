// Hook para productos base.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, deleteProduct, getProducts, updateProduct, getProductOptions } from '../../services/catalog/productService';

export const useProducts = () => {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });

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

  return {
    products: productsQuery.data ?? [],
    loading: productsQuery.isLoading,
    error: productsQuery.error?.message ?? null,
    saveProduct: async (product, id = null) => {
      if (id) await updateMutation.mutateAsync({ id, product });
      else await createMutation.mutateAsync(product);
      return true;
    },
    removeProduct: async (id) => {
      await deleteMutation.mutateAsync(id);
      return true;
    },
  };
};

export const useProductOptions = (search = '') => {
  const query = useQuery({
    queryKey: ['productOptions', search],
    queryFn: () => getProductOptions(search),
    keepPreviousData: true,
  });

  return {
    productOptions: query.data ?? [],
    loading: query.isLoading,
  };
};
