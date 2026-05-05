// Hook para almacenes.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWarehouses, createWarehouse, updateWarehouse, deactivateWarehouse, deleteWarehouse } from '../../services/inventory/warehouseService';

export const useWarehouses = () => {
  const queryClient = useQueryClient();

  const warehousesQuery = useQuery({
    queryKey: ['warehouses'],
    queryFn: getWarehouses,
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
    warehouses: warehousesQuery.data ?? [],
    loading: warehousesQuery.isLoading,
    error: warehousesQuery.error?.message ?? null,
    createWarehouse: createMutation.mutateAsync,
    updateWarehouse: (id, warehouse) => updateMutation.mutateAsync({ id, warehouse }),
    deactivateWarehouse: deactivateMutation.mutateAsync,
    deleteWarehouse: deleteMutation.mutateAsync,
  };
};