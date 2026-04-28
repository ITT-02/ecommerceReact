// Hook para pedidos.

import { useQuery } from '@tanstack/react-query';
import { getMyOrders } from '../services/orderService';

export const useOrders = () => {
  const ordersQuery = useQuery({ queryKey: ['my-orders'], queryFn: getMyOrders });

  return {
    orders: ordersQuery.data ?? [],
    loading: ordersQuery.isLoading,
    error: ordersQuery.error?.message ?? null,
  };
};
