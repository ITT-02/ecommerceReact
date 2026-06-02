// Hook administrativo para pedidos.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelOrderAdmin,
  changeOrderStatus,
  getOrderDetail,
  getOrders,
  registerOrderRefundAdmin,
  reopenOrderAdmin,
  registerShipmentTrackingAdmin,
  syncCommercialExpirations,
} from '../../services/sales/orderService';
import {
  mapCancelOrderFormToPayload,
  mapOrderStatusFormToPayload,
  mapRefundFormToPayload,
  mapReopenOrderFormToPayload,
} from '../../adapters/orderAdapter';

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
    queryFn: async () => {
      await syncCommercialExpirations();
      return getOrders({
        pageNumber,
        pageSize,
        search,
        estadoPedido,
        estadoPago,
        fechaInicio,
        fechaFin,
      });
    },
  });

  const invalidateOrders = () => queryClient.invalidateQueries({ queryKey: ordersQueryKey });

  const changeStatusMutation = useMutation({
    mutationFn: (form) => changeOrderStatus(mapOrderStatusFormToPayload(form)),
    onSuccess: invalidateOrders,
  });

  const cancelMutation = useMutation({
    mutationFn: (form) => cancelOrderAdmin(mapCancelOrderFormToPayload(form)),
    onSuccess: invalidateOrders,
  });

  const reopenMutation = useMutation({
    mutationFn: (form) => reopenOrderAdmin(mapReopenOrderFormToPayload(form)),
    onSuccess: invalidateOrders,
  });

  const refundMutation = useMutation({
    mutationFn: (form) => registerOrderRefundAdmin(mapRefundFormToPayload(form)),
    onSuccess: () => {
      invalidateOrders();
      queryClient.invalidateQueries({ queryKey: ['refunds-admin'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });

  const trackingMutation = useMutation({
    mutationFn: registerShipmentTrackingAdmin,
    onSuccess: invalidateOrders,
  });

  const loadingAction =
    changeStatusMutation.isPending ||
    cancelMutation.isPending ||
    reopenMutation.isPending ||
    refundMutation.isPending ||
    trackingMutation.isPending;

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
    error:
      getErrorMessage(ordersQuery.error) ||
      getErrorMessage(changeStatusMutation.error) ||
      getErrorMessage(cancelMutation.error) ||
      getErrorMessage(reopenMutation.error) ||
      getErrorMessage(refundMutation.error) ||
      getErrorMessage(trackingMutation.error),
    loadingAction,
    changingStatus: changeStatusMutation.isPending,
    canceling: cancelMutation.isPending,
    reopening: reopenMutation.isPending,
    refunding: refundMutation.isPending,
    savingTracking: trackingMutation.isPending,
    getOrderDetail,
    updateOrderStatus: async (form) => {
      await changeStatusMutation.mutateAsync(form);
      return true;
    },
    cancelOrder: async (form) => {
      await cancelMutation.mutateAsync(form);
      return true;
    },
    reopenOrder: async (form) => {
      await reopenMutation.mutateAsync(form);
      return true;
    },
    registerRefund: async (form) => {
      await refundMutation.mutateAsync(form);
      return true;
    },
    registerShipmentTracking: async (form) => {
      await trackingMutation.mutateAsync(form);
      return true;
    },
  };
};
