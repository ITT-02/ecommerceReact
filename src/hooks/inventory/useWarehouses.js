// Hook para almacenes.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deactivateWarehouse,
  deleteWarehouse,
} from '../../services/inventory/warehouseService';

export const useWarehouses = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
} = {}) => {
  const queryClient = useQueryClient();

  const warehousesQuery = useQuery({
    queryKey: ['warehouses', pageNumber, pageSize, search, esActivo],
    queryFn: () =>
      getWarehouses({
        pageNumber,
        pageSize,
        search,
        esActivo,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error) => {
      console.error('Error creando almacén:', error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, warehouse }) => updateWarehouse(id, warehouse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error) => {
      console.error('Error actualizando almacén:', error);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error) => {
      console.error('Error desactivando almacén:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (error) => {
      console.error('Error eliminando almacén:', error);
    },
  });

  return {
    warehouses: warehousesQuery.data?.items ?? [],

    pagination: {
      totalCount: warehousesQuery.data?.totalCount ?? 0,
      pageNumber: warehousesQuery.data?.pageNumber ?? pageNumber,
      pageSize: warehousesQuery.data?.pageSize ?? pageSize,
      totalPages: warehousesQuery.data?.totalPages ?? 0,
      hasPreviousPage: warehousesQuery.data?.hasPreviousPage ?? false,
      hasNextPage: warehousesQuery.data?.hasNextPage ?? false,
    },

    loading: warehousesQuery.isLoading,
    fetching: warehousesQuery.isFetching,
    error: warehousesQuery.error?.message ?? null,

    getWarehouseById,
    createWarehouse: createMutation.mutateAsync,
    updateWarehouse: (id, warehouse) => updateMutation.mutateAsync({ id, warehouse }),
    deactivateWarehouse: deactivateMutation.mutateAsync,
    deleteWarehouse: deleteMutation.mutateAsync,
  };
};