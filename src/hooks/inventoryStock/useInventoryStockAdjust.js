import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrarMovimientoInventario } from '../../services/inventoryStock/inventoryStockService';

export const useInventoryStockAdjust = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: registrarMovimientoInventario,
    onSuccess: () => {
      // Invalidar tablas y modales
      queryClient.invalidateQueries({ queryKey: ['inventoryStock'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStockMovements'] });
    },
  });

  return {
    adjust: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};

