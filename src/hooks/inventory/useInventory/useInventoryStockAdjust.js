import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registrarAjusteStock } from '../../../services/inventory/inventoryService';


export const useInventoryStockAdjust = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: registrarAjusteStock,
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