import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createOrderFromCart,
  getActiveStorePaymentMethods,
  getMyOrderDetail,
  getMyOrdersPaginated,
  registerOrderPayment,
} from '../../services/store/storeOrderService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useActiveStorePaymentMethods = () => {
  const methodsQuery = useQuery({
    queryKey: ['store-payment-methods', 'active'],
    queryFn: getActiveStorePaymentMethods,
  });

  return {
    methods: methodsQuery.data ?? [],
    loading: methodsQuery.isLoading,
    error: getErrorMessage(methodsQuery.error),
  };
};

export const useMyOrders = ({
  pageNumber = 1,
  pageSize = 10,
  estadoPedido = null,
  estadoPago = null,
  estadoEnvio = null,
} = {}) => {
  const ordersQuery = useQuery({
    queryKey: ['my-orders', pageNumber, pageSize, estadoPedido, estadoPago, estadoEnvio],
    queryFn: () =>
      getMyOrdersPaginated({ pageNumber, pageSize, estadoPedido, estadoPago, estadoEnvio }),
  });

  return {
    orders: ordersQuery.data?.items ?? [],
    pagination: {
      totalCount: ordersQuery.data?.totalCount ?? 0,
      pageNumber: ordersQuery.data?.pageNumber ?? pageNumber,
      pageSize: ordersQuery.data?.pageSize ?? pageSize,
      totalPages: ordersQuery.data?.totalPages ?? 0,
      hasPreviousPage: ordersQuery.data?.hasPreviousPage ?? false,
      hasNextPage: ordersQuery.data?.hasNextPage ?? false,
    },
    loading: ordersQuery.isLoading,
    error: getErrorMessage(ordersQuery.error),
  };
};

export const useMyOrderDetail = (id) => {
  const detailQuery = useQuery({
    queryKey: ['my-order-detail', id],
    queryFn: () => getMyOrderDetail(id),
    enabled: Boolean(id),
  });

  return {
    order: detailQuery.data || null,
    loading: detailQuery.isLoading,
    error: getErrorMessage(detailQuery.error),
    refetch: detailQuery.refetch,
  };
};

export const useCheckout = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createOrderFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    },
  });

  return {
    creating: createMutation.isPending,
    error: getErrorMessage(createMutation.error),
    createOrder: async (payload) => createMutation.mutateAsync(payload),
  };
};

export const useRegisterOrderPayment = (pedidoId) => {
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: registerOrderPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-order-detail', pedidoId] });
    },
  });

  return {
    registerPayment: async (payload) => paymentMutation.mutateAsync(payload),
    registering: paymentMutation.isPending,
    error: getErrorMessage(paymentMutation.error),
  };
};
