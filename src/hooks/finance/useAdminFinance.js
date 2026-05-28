import { useQuery } from '@tanstack/react-query';
import { getFinanceSummary, getProfitOrders } from '../../services/finance/financeService';

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || null;

export const useAdminFinance = ({ pageNumber = 1, pageSize = 10, search = '', fechaInicio = null, fechaFin = null } = {}) => {
  const summaryQuery = useQuery({
    queryKey: ['finance-summary', fechaInicio, fechaFin],
    queryFn: () => getFinanceSummary({ fechaInicio, fechaFin }),
  });

  const ordersQuery = useQuery({
    queryKey: ['finance-profit-orders', pageNumber, pageSize, search, fechaInicio, fechaFin],
    queryFn: () => getProfitOrders({ pageNumber, pageSize, search, fechaInicio, fechaFin }),
  });

  return {
    summary: summaryQuery.data || {},
    orders: ordersQuery.data?.items ?? [],
    pagination: {
      totalCount: ordersQuery.data?.totalCount ?? 0,
      pageNumber: ordersQuery.data?.pageNumber ?? pageNumber,
      pageSize: ordersQuery.data?.pageSize ?? pageSize,
      totalPages: ordersQuery.data?.totalPages ?? 0,
      hasPreviousPage: ordersQuery.data?.hasPreviousPage ?? false,
      hasNextPage: ordersQuery.data?.hasNextPage ?? false,
    },
    loading: summaryQuery.isLoading || ordersQuery.isLoading,
    fetching: summaryQuery.isFetching || ordersQuery.isFetching,
    error: getErrorMessage(summaryQuery.error) || getErrorMessage(ordersQuery.error),
  };
};
