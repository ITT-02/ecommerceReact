// Hook para pedidos.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeOrderStatus,
  getOrderDetail,
  getOrders,
} from '../../services/sales/orderService';
import { mapOrderStatusFormToPayload } from '../../adapters/orderAdapter';

const ordersQueryKey = ['orders-admin'];

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useOrders = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estadoPedido = null,
  estadoPago = null,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: [
      ...ordersQueryKey,
      pageNumber,
      pageSize,
      search,
      estadoPedido,
      estadoPago,
      fechaInicio,
      fechaFin,
    ],
    queryFn: () =>
      getOrders({
        pageNumber,
        pageSize,
        search,
        estadoPedido,
        estadoPago,
        fechaInicio,
        fechaFin,
      }),
  });

  const changeStatusMutation = useMutation({
    mutationFn: (form) => changeOrderStatus(mapOrderStatusFormToPayload(form)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersQueryKey }),
  });

  return {
    orders: ordersQuery.data?.items ?? [],
    loading: ordersQuery.isLoading,
    fetching: ordersQuery.isFetching,
    pagination: {
      totalCount: ordersQuery.data?.totalCount ?? 0,
      pageNumber: ordersQuery.data?.pageNumber ?? pageNumber,
      pageSize: ordersQuery.data?.pageSize ?? pageSize,
      totalPages: ordersQuery.data?.totalPages ?? 0,
      hasPreviousPage: ordersQuery.data?.hasPreviousPage ?? false,
      hasNextPage: ordersQuery.data?.hasNextPage ?? false,
    },
    error: getErrorMessage(ordersQuery.error) || getErrorMessage(changeStatusMutation.error),
    changingStatus: changeStatusMutation.isPending,
    getOrderDetail,
    updateOrderStatus: async (form) => {
      await changeStatusMutation.mutateAsync(form);
      return true;
    },
  };
};
