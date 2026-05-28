// Hooks para logística administrativa.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deactivateCarrier,
  getCarriers,
  getShipments,
  registerShipmentTracking,
  saveCarrier,
} from '../../services/logistics/shipmentService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useShipments = ({ pageNumber = 1, pageSize = 10, search = '', estadoEnvio = null } = {}) => {
  const queryClient = useQueryClient();

  const shipmentsQuery = useQuery({
    queryKey: ['shipments-admin', pageNumber, pageSize, search, estadoEnvio],
    queryFn: () => getShipments({ pageNumber, pageSize, search, estadoEnvio }),
  });

  const trackingMutation = useMutation({
    mutationFn: registerShipmentTracking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments-admin'] });
      queryClient.invalidateQueries({ queryKey: ['orders-admin'] });
    },
  });

  return {
    shipments: shipmentsQuery.data?.items ?? [],
    pagination: {
      totalCount: shipmentsQuery.data?.totalCount ?? 0,
      pageNumber: shipmentsQuery.data?.pageNumber ?? pageNumber,
      pageSize: shipmentsQuery.data?.pageSize ?? pageSize,
      totalPages: shipmentsQuery.data?.totalPages ?? 0,
      hasPreviousPage: shipmentsQuery.data?.hasPreviousPage ?? false,
      hasNextPage: shipmentsQuery.data?.hasNextPage ?? false,
    },
    loading: shipmentsQuery.isLoading,
    fetching: shipmentsQuery.isFetching,
    error: getErrorMessage(shipmentsQuery.error) || getErrorMessage(trackingMutation.error),
    savingTracking: trackingMutation.isPending,
    saveTracking: (payload) => trackingMutation.mutateAsync(payload),
  };
};

export const useCarriers = ({ pageNumber = 1, pageSize = 10, search = '', esActivo = null } = {}) => {
  const queryClient = useQueryClient();

  const carriersQuery = useQuery({
    queryKey: ['carriers-admin', pageNumber, pageSize, search, esActivo],
    queryFn: () => getCarriers({ pageNumber, pageSize, search, esActivo }),
  });

  const saveMutation = useMutation({
    mutationFn: saveCarrier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carriers-admin'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateCarrier,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['carriers-admin'] }),
  });

  return {
    carriers: carriersQuery.data?.items ?? [],
    pagination: {
      totalCount: carriersQuery.data?.totalCount ?? 0,
      pageNumber: carriersQuery.data?.pageNumber ?? pageNumber,
      pageSize: carriersQuery.data?.pageSize ?? pageSize,
      totalPages: carriersQuery.data?.totalPages ?? 0,
      hasPreviousPage: carriersQuery.data?.hasPreviousPage ?? false,
      hasNextPage: carriersQuery.data?.hasNextPage ?? false,
    },
    loading: carriersQuery.isLoading,
    fetching: carriersQuery.isFetching,
    error: getErrorMessage(carriersQuery.error) || getErrorMessage(saveMutation.error) || getErrorMessage(deactivateMutation.error),
    saving: saveMutation.isPending,
    deactivating: deactivateMutation.isPending,
    saveCarrier: (payload) => saveMutation.mutateAsync(payload),
    deactivateCarrier: (carrier) => deactivateMutation.mutateAsync(carrier),
  };
};
