import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deactivateWarehouse,
} from '../../services/inventory/warehouseService';

/**
 * Hook principal para almacenes.
 *
 * Responsabilidad:
 * - Listar almacenes paginados.
 * - Crear almacén.
 * - Actualizar almacén.
 * - Desactivar almacén.
 * - Invalidar la consulta después de cambios.
 */
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
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, warehouse }) => updateWarehouse(id, warehouse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
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

    createWarehouse: createMutation.mutateAsync,

    getWarehouseById,
    updateWarehouse: (id, warehouse) =>
      updateMutation.mutateAsync({ id, warehouse }),

    deactivateWarehouse: deactivateMutation.mutateAsync,
  };
};