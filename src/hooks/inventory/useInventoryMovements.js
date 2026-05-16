import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryMovementService } from '../../services/inventory/inventoryMovementService';

export const useInventoryMovements = ({ pageNumber, pageSize, search, tipoMovimiento } = {}) => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ['inventory-movements', pageNumber, pageSize, search, tipoMovimiento];

  // 1. Hook para Listar Paginado
  const movementsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => inventoryMovementService.getMovements({ pageNumber, pageSize, search, tipoMovimiento }),
    keepPreviousData: true, // Útil para que la tabla no parpadee al cambiar de página
    staleTime: 5000,
  });

  // 2. Mutación para Registrar
  const registerMutation = useMutation({
    mutationFn: inventoryMovementService.registerMovement,
    onSuccess: () => {
      // Invalida la lista para que la tabla se recargue automáticamente
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
  });

  // 3. Mutación para Anular
  const cancelMutation = useMutation({
    mutationFn: inventoryMovementService.cancelMovement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
  });

  return {
    // Datos y estados de lectura
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

    // Acciones y estados de escritura
    registerMovement: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    
    cancelMovement: cancelMutation.mutateAsync,
    isCanceling: cancelMutation.isPending,
  };
};