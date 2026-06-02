import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryMovementService } from '../../services/inventory/inventoryMovementService';

export const useInventoryMovements = ({
  pageNumber,
  pageSize,
  search,
  tipoMovimiento,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const queryClient = useQueryClient();

  const queryKey = [
    'inventory-movements',
    pageNumber,
    pageSize,
    search,
    tipoMovimiento,
    fechaInicio,
    fechaFin,
  ];

  const movementsQuery = useQuery({
    queryKey,
    queryFn: () =>
      inventoryMovementService.getMovements({
        pageNumber,
        pageSize,
        search,
        tipoMovimiento,
        fechaInicio,
        fechaFin,
      }),
    keepPreviousData: true,
    staleTime: 5000,
  });

  const registerMutation = useMutation({
    mutationFn: inventoryMovementService.registerMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: inventoryMovementService.cancelMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
  });

  return {
    movements: movementsQuery.data?.items || [],
    pagination: {
      totalCount: movementsQuery.data?.totalCount || 0,
      pageNumber: movementsQuery.data?.pageNumber || 1,
      pageSize: movementsQuery.data?.pageSize || 10,
      totalPages: movementsQuery.data?.totalPages || 0,
    },
    isLoading: movementsQuery.isLoading,
    isFetching: movementsQuery.isFetching,
    error: movementsQuery.error,

    registerMovement: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,

    cancelMovement: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
  };
};
