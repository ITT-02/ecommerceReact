import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createManualQuote,
  createManualSale,
  searchManualSaleProducts,
} from '../../services/sales/manualSaleService';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || null;

export const useManualSaleProducts = ({ search = '', categoriaId = null } = {}) => {
  const query = useQuery({
    queryKey: ['manual-sale-products', search, categoriaId],
    queryFn: () => searchManualSaleProducts({ search, categoriaId }),
  });

  return {
    products: query.data || [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: getErrorMessage(query.error),
  };
};

export const useManualSale = () => {
  const queryClient = useQueryClient();

  const createSaleMutation = useMutation({
    mutationFn: createManualSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-admin'] });
      queryClient.invalidateQueries({ queryKey: ['payments-admin'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-admin'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance-profit-orders'] });
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: createManualQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes-admin'] });
    },
  });

  return {
    creating: createSaleMutation.isPending || createQuoteMutation.isPending,
    error: getErrorMessage(createSaleMutation.error) || getErrorMessage(createQuoteMutation.error),
    createSale: async (payload) => createSaleMutation.mutateAsync(payload),
    createQuote: async (payload) => createQuoteMutation.mutateAsync(payload),
  };
};
