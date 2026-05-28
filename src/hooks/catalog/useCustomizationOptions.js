// Hooks para opciones de personalización y reglas por producto.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deactivateCustomizationOption,
  getCustomizationOptions,
  getProductCustomizationOptions,
  saveCustomizationOption,
  saveProductCustomizationOptions,
} from '../../services/catalog/customizationService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useCustomizationOptions = ({ onlyActive = false } = {}) => {
  const queryClient = useQueryClient();

  const optionsQuery = useQuery({
    queryKey: ['customization-options', onlyActive],
    queryFn: () => getCustomizationOptions({ onlyActive }),
  });

  const saveMutation = useMutation({
    mutationFn: saveCustomizationOption,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customization-options'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCustomizationOption,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customization-options'] }),
  });

  return {
    options: optionsQuery.data ?? [],
    loading: optionsQuery.isLoading,
    fetching: optionsQuery.isFetching,
    saving: saveMutation.isPending || deactivateMutation.isPending,
    error:
      getErrorMessage(optionsQuery.error) ||
      getErrorMessage(saveMutation.error) ||
      getErrorMessage(deactivateMutation.error),
    saveOption: async (payload) => saveMutation.mutateAsync(payload),
    deactivateOption: async (payload) => deactivateMutation.mutateAsync(payload),
  };
};

export const useProductCustomizationOptions = (productId) => {
  const queryClient = useQueryClient();

  const productOptionsQuery = useQuery({
    queryKey: ['product-customization-options', productId],
    queryFn: () => getProductCustomizationOptions(productId),
    enabled: Boolean(productId),
  });

  const saveMutation = useMutation({
    mutationFn: saveProductCustomizationOptions,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-customization-options', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['store-product-detail'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    productOptions: productOptionsQuery.data ?? [],
    loading: productOptionsQuery.isLoading,
    saving: saveMutation.isPending,
    error: getErrorMessage(productOptionsQuery.error) || getErrorMessage(saveMutation.error),
    saveProductOptions: async ({ productId: targetProductId, options }) =>
      saveMutation.mutateAsync({ productId: targetProductId, options }),
  };
};
