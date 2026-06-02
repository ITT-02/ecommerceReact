//Reembolso
import { useQuery } from '@tanstack/react-query';

import { getRefundsAdmin } from '../../services/finance/refundService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useRefunds = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const query = useQuery({
    queryKey: ['refunds-admin', pageNumber, pageSize, search, estado, fechaInicio, fechaFin],
    queryFn: () =>
      getRefundsAdmin({
        pageNumber,
        pageSize,
        search,
        estado,
        fechaInicio,
        fechaFin,
      }),
    keepPreviousData: true,
  });

  return {
    refunds: query.data?.items ?? [],
    pagination: {
      totalCount: query.data?.totalCount ?? 0,
      pageNumber: query.data?.pageNumber ?? pageNumber,
      pageSize: query.data?.pageSize ?? pageSize,
      totalPages: query.data?.totalPages ?? 0,
      hasPreviousPage: query.data?.hasPreviousPage ?? false,
      hasNextPage: query.data?.hasNextPage ?? false,
    },
    loading: query.isLoading,
    fetching: query.isFetching,
    error: getErrorMessage(query.error),
  };
};
