import { useQuery } from '@tanstack/react-query';
import { listarMovimientosInventarioPaginado } from '../../services/inventoryStock/inventoryStockService';

export const useInventoryStockMovements = ({
  varianteId,
  almacenId,
  enabled,
  pageNumber = 1,
  pageSize = 10,
} = {}) => {
  return useQuery({
    queryKey: ['inventoryStockMovements', varianteId, almacenId, pageNumber, pageSize],
    queryFn: () =>
      listarMovimientosInventarioPaginado({
        varianteId,
        almacenId,
        pageNumber,
        pageSize,
      }),
    enabled: Boolean(enabled && varianteId && almacenId),
    keepPreviousData: true,
  });
};

