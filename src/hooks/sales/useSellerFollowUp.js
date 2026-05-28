// Hooks para el módulo de seguimiento del vendedor.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getSellerManualQuotes,
  getSellerManualSales,
  markManualQuoteCommunicated,
  registerManualQuotePayment,
} from '../../services/sales/sellerFollowUpService';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || null;

export const useSellerManualQuotes = ({ pageNumber = 1, pageSize = 10, search = '', estado = '' } = {}) => {
  const query = useQuery({
    queryKey: ['seller-manual-quotes', pageNumber, pageSize, search, estado],
    queryFn: () => getSellerManualQuotes({ pageNumber, pageSize, search, estado: estado || null }),
  });

  return {
    quotes: query.data?.items ?? [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: getErrorMessage(query.error),
    pagination: {
      totalCount: query.data?.totalCount ?? 0,
      pageNumber: query.data?.pageNumber ?? pageNumber,
      pageSize: query.data?.pageSize ?? pageSize,
      totalPages: query.data?.totalPages ?? 0,
      hasPreviousPage: query.data?.hasPreviousPage ?? false,
      hasNextPage: query.data?.hasNextPage ?? false,
    },
  };
};

export const useSellerManualSales = ({ pageNumber = 1, pageSize = 10, search = '', estadoPago = '' } = {}) => {
  const query = useQuery({
    queryKey: ['seller-manual-sales', pageNumber, pageSize, search, estadoPago],
    queryFn: () => getSellerManualSales({ pageNumber, pageSize, search, estadoPago: estadoPago || null }),
  });

  return {
    sales: query.data?.items ?? [],
    loading: query.isLoading,
    fetching: query.isFetching,
    error: getErrorMessage(query.error),
    pagination: {
      totalCount: query.data?.totalCount ?? 0,
      pageNumber: query.data?.pageNumber ?? pageNumber,
      pageSize: query.data?.pageSize ?? pageSize,
      totalPages: query.data?.totalPages ?? 0,
      hasPreviousPage: query.data?.hasPreviousPage ?? false,
      hasNextPage: query.data?.hasNextPage ?? false,
    },
  };
};

export const useSellerFollowUpActions = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-manual-quotes'] });
    queryClient.invalidateQueries({ queryKey: ['seller-manual-sales'] });
    queryClient.invalidateQueries({ queryKey: ['quotes-admin'] });
    queryClient.invalidateQueries({ queryKey: ['orders-admin'] });
    queryClient.invalidateQueries({ queryKey: ['payments-admin'] });
  };

  const communicateMutation = useMutation({
    mutationFn: markManualQuoteCommunicated,
    onSuccess: invalidate,
  });

  const paymentMutation = useMutation({
    mutationFn: registerManualQuotePayment,
    onSuccess: invalidate,
  });

  return {
    saving: communicateMutation.isPending || paymentMutation.isPending,
    error: getErrorMessage(communicateMutation.error) || getErrorMessage(paymentMutation.error),
    markCommunicated: async (payload) => communicateMutation.mutateAsync(payload),
    registerPayment: async (payload) => paymentMutation.mutateAsync(payload),
  };
};
