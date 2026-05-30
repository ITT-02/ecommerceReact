import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  cancelGoodsReception,
  changePurchaseOrderStatus,
  getGoodsReceptionDetail,
  getGoodsReceptions,
  getProcurementOptions,
  getPurchaseOrderDetail,
  getPurchaseOrders,
  getPurchaseOrdersPendingReception,
  getSupplierProducts,
  getSuppliers,
  registerGoodsReception,
  savePurchaseOrder,
  saveSupplier,
  saveSupplierProducts,
} from '../../services/procurement/procurementService';
import { normalizeApiError } from '../../utils/api/normalizeApiError';

export const useProcurementOptions = (search = '') => {
  const query = useQuery({
    queryKey: ['procurement-options', search],
    queryFn: () => getProcurementOptions(search),
    staleTime: 1000 * 60 * 5,
  });

  return {
    proveedores: query.data?.proveedores ?? [],
    almacenes: query.data?.almacenes ?? [],
    variantes: query.data?.variantes ?? [],
    loading: query.isLoading,
    error: normalizeApiError(query.error),
  };
};

export const useSuppliersAdmin = ({ pageNumber, pageSize, search, isActive } = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['suppliers-admin', pageNumber, pageSize, search, isActive],
    queryFn: () => getSuppliers({ pageNumber, pageSize, search, isActive }),
    placeholderData: (previousData) => previousData,
  });

  const saveMutation = useMutation({
    mutationFn: saveSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers-admin'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-options'] });
    },
  });

  const productsMutation = useMutation({
    mutationFn: saveSupplierProducts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      queryClient.invalidateQueries({ queryKey: ['procurement-options'] });
    },
  });

  return {
    rows: query.data?.items ?? [],
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
    saving: saveMutation.isPending || productsMutation.isPending,
    // Los errores de mutación se manejan localmente en la página.
    // Así evitamos que un error anterior quede pegado después de cerrar/reabrir diálogos.
    error: normalizeApiError(query.error),
    saveSupplier: (supplier) => saveMutation.mutateAsync(supplier),
    saveSupplierProducts: (payload) => productsMutation.mutateAsync(payload),
  };
};

export const useSupplierProducts = (supplierId, enabled = false) => {
  const query = useQuery({
    queryKey: ['supplier-products', supplierId],
    queryFn: () => getSupplierProducts(supplierId),
    enabled: Boolean(supplierId) && enabled,
  });

  return {
    items: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: normalizeApiError(query.error),
  };
};

export const usePurchaseOrdersAdmin = ({ pageNumber, pageSize, search, estado, proveedorId } = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['purchase-orders-admin', pageNumber, pageSize, search, estado, proveedorId],
    queryFn: () => getPurchaseOrders({ pageNumber, pageSize, search, estado, proveedorId }),
    placeholderData: (previousData) => previousData,
  });

  const saveMutation = useMutation({
    mutationFn: savePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders-admin'] });
      queryClient.invalidateQueries({ queryKey: ['pending-purchase-orders'] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: changePurchaseOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders-admin'] });
      queryClient.invalidateQueries({ queryKey: ['pending-purchase-orders'] });
    },
  });

  return {
    rows: query.data?.items ?? [],
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
    saving: saveMutation.isPending || statusMutation.isPending,
    // Los errores de mutación se manejan localmente en la página.
    // Así evitamos que un error anterior quede pegado después de cerrar/reabrir diálogos.
    error: normalizeApiError(query.error),
    savePurchaseOrder: (payload) => saveMutation.mutateAsync(payload),
    changeStatus: (payload) => statusMutation.mutateAsync(payload),
  };
};

export const usePurchaseOrderDetail = (purchaseOrderId, enabled = false) => {
  const query = useQuery({
    queryKey: ['purchase-order-detail', purchaseOrderId],
    queryFn: () => getPurchaseOrderDetail(purchaseOrderId),
    enabled: Boolean(purchaseOrderId) && enabled,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: normalizeApiError(query.error),
  };
};

export const usePendingPurchaseOrders = (search = '', enabled = true) => {
  const query = useQuery({
    queryKey: ['pending-purchase-orders', search],
    queryFn: () => getPurchaseOrdersPendingReception(search),
    enabled,
    staleTime: 1000 * 60 * 3,
  });

  return {
    orders: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: normalizeApiError(query.error),
  };
};

export const useGoodsReceptionsAdmin = ({
  pageNumber,
  pageSize,
  search,
  estado,
  proveedorId,
  almacenId,
} = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['goods-receptions-admin', pageNumber, pageSize, search, estado, proveedorId, almacenId],
    queryFn: () => getGoodsReceptions({ pageNumber, pageSize, search, estado, proveedorId, almacenId }),
    placeholderData: (previousData) => previousData,
  });

  const invalidateReceptionFlow = () => {
    queryClient.invalidateQueries({ queryKey: ['goods-receptions-admin'] });
    queryClient.invalidateQueries({ queryKey: ['purchase-orders-admin'] });
    queryClient.invalidateQueries({ queryKey: ['pending-purchase-orders'] });
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    queryClient.invalidateQueries({ queryKey: ['variants'] });
    queryClient.invalidateQueries({ queryKey: ['procurement-options'] });
  };

  const registerMutation = useMutation({
    mutationFn: registerGoodsReception,
    onSuccess: invalidateReceptionFlow,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelGoodsReception,
    onSuccess: invalidateReceptionFlow,
  });

  return {
    rows: query.data?.items ?? [],
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
    saving: registerMutation.isPending || cancelMutation.isPending,
    // Los errores de mutación se manejan localmente en la página.
    // Así evitamos que un error anterior quede pegado después de cerrar/reabrir diálogos.
    error: normalizeApiError(query.error),
    registerReception: (payload) => registerMutation.mutateAsync(payload),
    cancelReception: (payload) => cancelMutation.mutateAsync(payload),
  };
};

export const useGoodsReceptionDetail = (receptionId, enabled = false) => {
  const query = useQuery({
    queryKey: ['goods-reception-detail', receptionId],
    queryFn: () => getGoodsReceptionDetail(receptionId),
    enabled: Boolean(receptionId) && enabled,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading || query.isFetching,
    error: normalizeApiError(query.error),
  };
};
