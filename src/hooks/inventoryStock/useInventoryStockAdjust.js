// src/hooks/inventoryStock/useInventoryStockAdjust.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrarAjusteStock } from '../../services/inventoryStock/inventoryStockService';


export const useInventoryStockAdjust = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: registrarAjusteStock,  // ← Solo ajustes
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryStock'] });
    },
  });

  return {
    adjust: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error?.message ?? null,
  };
};