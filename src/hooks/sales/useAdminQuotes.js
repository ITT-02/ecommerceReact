// Hook administrativo para cotizaciones.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changeAdminQuoteStatus,
  getAdminQuoteDetail,
  getAdminQuotes,
  respondAdminQuote,
} from '../../services/sales/quoteService';

const quotesQueryKey = ['quotes-admin'];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useAdminQuotes = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const queryClient = useQueryClient();

  const quotesQuery = useQuery({
    queryKey: [quotesQueryKey, pageNumber, pageSize, search, estado, fechaInicio, fechaFin],
    queryFn: () =>
      getAdminQuotes({ pageNumber, pageSize, search, estado, fechaInicio, fechaFin }),
  });

  const respondMutation = useMutation({
    mutationFn: respondAdminQuote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quotesQueryKey }),
  });

  const statusMutation = useMutation({
    mutationFn: changeAdminQuoteStatus,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quotesQueryKey }),
  });

  return {
    quotes: quotesQuery.data?.items ?? [],
    loading: quotesQuery.isLoading,
    fetching: quotesQuery.isFetching,
    pagination: {
      totalCount: quotesQuery.data?.totalCount ?? 0,
      pageNumber: quotesQuery.data?.pageNumber ?? pageNumber,
      pageSize: quotesQuery.data?.pageSize ?? pageSize,
      totalPages: quotesQuery.data?.totalPages ?? 0,
      hasPreviousPage: quotesQuery.data?.hasPreviousPage ?? false,
      hasNextPage: quotesQuery.data?.hasNextPage ?? false,
    },
    error:
      getErrorMessage(quotesQuery.error) ||
      getErrorMessage(respondMutation.error) ||
      getErrorMessage(statusMutation.error),
    saving: respondMutation.isPending || statusMutation.isPending,
    getQuoteDetail: getAdminQuoteDetail,
    respondQuote: async (payload) => respondMutation.mutateAsync(payload),
    changeQuoteStatus: async (payload) => statusMutation.mutateAsync(payload),
  };
};
