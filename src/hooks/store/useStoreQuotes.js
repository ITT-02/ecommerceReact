// Hooks de cotizaciones del cliente.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  acceptMyQuote,
  cancelMyQuote,
  createQuoteRequest,
  getMyQuoteDetail,
  getMyQuotesPaginated,
  markMyQuoteAsRead,
} from '../../services/store/storeQuoteService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useCreateQuoteRequest = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createQuoteRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quotes'] });
    },
  });

  return {
    creating: mutation.isPending,
    error: getErrorMessage(mutation.error),
    createQuote: async (payload) => mutation.mutateAsync(payload),
  };
};

export const useMyQuotes = ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  search = '',
} = {}) => {
  const quotesQuery = useQuery({
    queryKey: ['my-quotes', pageNumber, pageSize, estado, search],
    queryFn: () => getMyQuotesPaginated({ pageNumber, pageSize, estado, search }),
  });

  return {
    quotes: quotesQuery.data?.items ?? [],
    pagination: {
      totalCount: quotesQuery.data?.totalCount ?? 0,
      pageNumber: quotesQuery.data?.pageNumber ?? pageNumber,
      pageSize: quotesQuery.data?.pageSize ?? pageSize,
      totalPages: quotesQuery.data?.totalPages ?? 0,
      hasPreviousPage: quotesQuery.data?.hasPreviousPage ?? false,
      hasNextPage: quotesQuery.data?.hasNextPage ?? false,
    },
    loading: quotesQuery.isLoading,
    fetching: quotesQuery.isFetching,
    error: getErrorMessage(quotesQuery.error),
  };
};

export const useMyQuoteDetail = (id) => {
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: ['my-quote-detail', id],
    queryFn: () => getMyQuoteDetail(id),
    enabled: Boolean(id),
  });

  const markReadMutation = useMutation({
    mutationFn: markMyQuoteAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quote-detail', id] });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: acceptMyQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quote-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMyQuote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-quotes'] });
      queryClient.invalidateQueries({ queryKey: ['my-quote-detail', id] });
    },
  });

  return {
    quote: detailQuery.data || null,
    loading: detailQuery.isLoading,
    fetching: detailQuery.isFetching,
    saving:
      markReadMutation.isPending ||
      acceptMutation.isPending ||
      cancelMutation.isPending,
    error:
      getErrorMessage(detailQuery.error) ||
      getErrorMessage(markReadMutation.error) ||
      getErrorMessage(acceptMutation.error) ||
      getErrorMessage(cancelMutation.error),
    markAsRead: async (cotizacionId) => markReadMutation.mutateAsync(cotizacionId),
    acceptQuote: async (payload) => acceptMutation.mutateAsync(payload),
    cancelQuote: async (payload) => cancelMutation.mutateAsync(payload),
  };
};
