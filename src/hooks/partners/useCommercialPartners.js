import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPartnerProductRequest,
  getCommercialPartnerReport,
  getMyPartnerProductsForVariants,
  getPartnerAttributeOptions,
  getPartnerCategoryOptions,
  listCommercialPartnerAccountRequests,
  listPartnerProductRequests,
  requestCommercialPartnerAccount,
  reviewCommercialPartnerAccountRequest,
  reviewPartnerProductRequest,
  updatePartnerProductCommercialConditions,
} from '../../services/partners/commercialPartnerService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const usePartnerProductRequests = ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  scope = 'mine',
  search = '',
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['partner-product-requests', pageNumber, pageSize, estado, scope, search, fechaInicio, fechaFin],
    queryFn: () => listPartnerProductRequests({ pageNumber, pageSize, estado, scope, search, fechaInicio, fechaFin }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['partner-product-categories'],
    queryFn: getPartnerCategoryOptions,
    staleTime: 1000 * 60 * 15,
  });

  const attributesQuery = useQuery({
    queryKey: ['partner-variant-attributes'],
    queryFn: getPartnerAttributeOptions,
    staleTime: 1000 * 60 * 15,
  });

  const createMutation = useMutation({
    mutationFn: createPartnerProductRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partner-product-requests'] }),
  });

  const reviewMutation = useMutation({
    mutationFn: reviewPartnerProductRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partner-product-requests'] }),
  });

  return {
    requests: requestsQuery.data?.items ?? [],
    categories: categoriesQuery.data ?? [],
    attributes: attributesQuery.data ?? [],
    pagination: {
      totalCount: requestsQuery.data?.totalCount ?? 0,
      pageNumber: requestsQuery.data?.pageNumber ?? pageNumber,
      pageSize: requestsQuery.data?.pageSize ?? pageSize,
      totalPages: requestsQuery.data?.totalPages ?? 0,
      hasPreviousPage: requestsQuery.data?.hasPreviousPage ?? false,
      hasNextPage: requestsQuery.data?.hasNextPage ?? false,
    },
    loading: requestsQuery.isLoading || categoriesQuery.isLoading || attributesQuery.isLoading,
    fetching: requestsQuery.isFetching,
    saving: createMutation.isPending || reviewMutation.isPending,
    error:
      getErrorMessage(requestsQuery.error) ||
      getErrorMessage(categoriesQuery.error) ||
      getErrorMessage(attributesQuery.error) ||
      getErrorMessage(createMutation.error) ||
      getErrorMessage(reviewMutation.error),
    createRequest: createMutation.mutateAsync,
    reviewRequest: reviewMutation.mutateAsync,
  };
};


export const usePartnerProductCommercialConditions = () => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updatePartnerProductCommercialConditions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['partner-product-requests'] });
      queryClient.invalidateQueries({ queryKey: ['commercial-partner-report'] });
    },
  });

  return {
    updateCommercialConditions: updateMutation.mutateAsync,
    updating: updateMutation.isPending,
    error: getErrorMessage(updateMutation.error),
  };
};

export const useCommercialPartnerReport = ({ fechaInicio = null, fechaFin = null } = {}) => {
  const reportQuery = useQuery({
    queryKey: ['commercial-partner-report', fechaInicio, fechaFin],
    queryFn: () => getCommercialPartnerReport({ fechaInicio, fechaFin }),
  });

  return {
    report: reportQuery.data || { resumen: {}, productos: [] },
    loading: reportQuery.isLoading,
    fetching: reportQuery.isFetching,
    error: getErrorMessage(reportQuery.error),
  };
};


export const useMyPartnerProductsForVariants = ({ search = '' } = {}) => {
  const productsQuery = useQuery({
    queryKey: ['my-partner-products-for-variants', search],
    queryFn: () => getMyPartnerProductsForVariants({ search }),
    staleTime: 1000 * 60 * 5,
  });

  return {
    products: productsQuery.data ?? [],
    loading: productsQuery.isLoading,
    fetching: productsQuery.isFetching,
    error: getErrorMessage(productsQuery.error),
  };
};

export const useCommercialPartnerAccountRequest = () => {
  const requestMutation = useMutation({
    mutationFn: requestCommercialPartnerAccount,
  });

  return {
    requestAccount: requestMutation.mutateAsync,
    sending: requestMutation.isPending,
    success: requestMutation.isSuccess,
    error: getErrorMessage(requestMutation.error),
  };
};

export const useCommercialPartnerAccountRequestsAdmin = ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  search = '',
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({
    queryKey: ['commercial-partner-account-requests', pageNumber, pageSize, estado, search, fechaInicio, fechaFin],
    queryFn: () => listCommercialPartnerAccountRequests({ pageNumber, pageSize, estado, search, fechaInicio, fechaFin }),
  });

  const reviewMutation = useMutation({
    mutationFn: reviewCommercialPartnerAccountRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commercial-partner-account-requests'] }),
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
    loading: requestsQuery.isLoading,
    fetching: requestsQuery.isFetching,
    saving: reviewMutation.isPending,
    error: getErrorMessage(requestsQuery.error) || getErrorMessage(reviewMutation.error),
    reviewRequest: reviewMutation.mutateAsync,
  };
};
