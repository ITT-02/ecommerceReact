import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteWholesaleTier,
  listWholesaleRequests,
  listWholesaleTiers,
  listWholesaleTiersAdmin,
  listWholesaleVariantOptions,
  reviewWholesaleRequest,
  saveWholesaleTier,
} from '../../services/partners/wholesaleService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useWholesaleManagement = ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  fechaInicio = null,
  fechaFin = null,
  variantId = null,
  search = '',
  variantSearch = '',
  tiersPageNumber = 1,
  tiersPageSize = 10,
  tiersSearch = '',
  tiersFechaInicio = null,
  tiersFechaFin = null,
} = {}) => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['wholesale-requests', pageNumber, pageSize, estado, search, fechaInicio, fechaFin],
    queryFn: () => listWholesaleRequests({ pageNumber, pageSize, estado, search, fechaInicio, fechaFin }),
  });

  const variantsQuery = useQuery({
    queryKey: ['wholesale-variants', variantSearch],
    queryFn: () => listWholesaleVariantOptions(variantSearch),
    placeholderData: (previousData) => previousData,
  });

  const tiersQuery = useQuery({
    queryKey: ['wholesale-tiers', variantId],
    queryFn: () => listWholesaleTiers(variantId),
    enabled: Boolean(variantId),
  });

  const tiersAdminQuery = useQuery({
    queryKey: ['wholesale-tiers-admin', tiersPageNumber, tiersPageSize, tiersSearch, tiersFechaInicio, tiersFechaFin],
    queryFn: () => listWholesaleTiersAdmin({
      pageNumber: tiersPageNumber,
      pageSize: tiersPageSize,
      search: tiersSearch,
      fechaInicio: tiersFechaInicio,
      fechaFin: tiersFechaFin,
    }),
    placeholderData: (previousData) => previousData,
  });

  const reviewMutation = useMutation({
    mutationFn: reviewWholesaleRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wholesale-requests'] }),
  });

  const saveTierMutation = useMutation({
    mutationFn: saveWholesaleTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['wholesale-tiers-admin'] });
    },
  });

  const deleteTierMutation = useMutation({
    mutationFn: deleteWholesaleTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wholesale-tiers'] });
      queryClient.invalidateQueries({ queryKey: ['wholesale-tiers-admin'] });
    },
  });

  return {
    requests: requestsQuery.data?.items ?? [],
    pagination: {
      totalCount: requestsQuery.data?.totalCount ?? 0,
      pageNumber: requestsQuery.data?.pageNumber ?? pageNumber,
      pageSize: requestsQuery.data?.pageSize ?? pageSize,
      totalPages: requestsQuery.data?.totalPages ?? 0,
      hasPreviousPage: requestsQuery.data?.hasPreviousPage ?? false,
      hasNextPage: requestsQuery.data?.hasNextPage ?? false,
    },
    variants: variantsQuery.data ?? [],
    allTiers: tiersAdminQuery.data?.items ?? [],
    tiersPagination: {
      totalCount: tiersAdminQuery.data?.totalCount ?? 0,
      pageNumber: tiersAdminQuery.data?.pageNumber ?? tiersPageNumber,
      pageSize: tiersAdminQuery.data?.pageSize ?? tiersPageSize,
      totalPages: tiersAdminQuery.data?.totalPages ?? 0,
      hasPreviousPage: tiersAdminQuery.data?.hasPreviousPage ?? false,
      hasNextPage: tiersAdminQuery.data?.hasNextPage ?? false,
    },
    tiers: tiersQuery.data ?? [],
    loading: requestsQuery.isLoading || variantsQuery.isLoading || tiersQuery.isLoading || tiersAdminQuery.isLoading,
    fetching: requestsQuery.isFetching || tiersAdminQuery.isFetching,
    variantsFetching: variantsQuery.isFetching,
    saving: reviewMutation.isPending || saveTierMutation.isPending || deleteTierMutation.isPending,
    error:
      getErrorMessage(requestsQuery.error) ||
      getErrorMessage(variantsQuery.error) ||
      getErrorMessage(tiersQuery.error) ||
      getErrorMessage(tiersAdminQuery.error) ||
      getErrorMessage(reviewMutation.error) ||
      getErrorMessage(saveTierMutation.error) ||
      getErrorMessage(deleteTierMutation.error),
    reviewRequest: reviewMutation.mutateAsync,
    saveTier: saveTierMutation.mutateAsync,
    deleteTier: deleteTierMutation.mutateAsync,
  };
};
