// Hook para pedidos.


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrders } from '../../services/sales/orderService';

const ordersQueryKey = ['orders-admin'];
const hoy = new Date();
const year = hoy.getFullYear();
const month = hoy.getMonth();

export const useOrders = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estadoPedido = null,
  estadoPago = null,
  fechaInicio =  new Date(year,month,1).toISOString().split('T')[0],
  fechaFin = new Date(year,month+1,0).toISOString().split('T')[0],
} = {}) => {
 //const queryClient = useQueryClient();
const ordersQuery = useQuery({ queryKey: [
  ... ordersQueryKey,
  pageNumber,
  pageSize,
  search,
  estadoPedido,
  estadoPago,
  fechaInicio,
  fechaFin,

  ], queryFn: () => getOrders(
    {
      pageNumber,
      pageSize,
      search,
      estadoPedido,
      estadoPago,
      fechaInicio,
      fechaFin,
    }),
  });

  return {
    orders: ordersQuery.data?.items?? [],
    loading: ordersQuery.isLoading,
    pagination: {
      totalCount: ordersQuery.data?.totalCount ?? 0,
      pageNumber: ordersQuery.data?.pageNumber ?? pageNumber,
      pageSize: ordersQuery.data?.pageSize ?? pageSize,
      totalPages: ordersQuery.data?.totalPages ?? 0,
      hasPreviousPage: ordersQuery.data?.hasPreviousPage ?? false,
      hasNextPage: ordersQuery.data?.hasNextPage ?? false,
    },
    error: ordersQuery.error?.message ?? null,
  };
};
