import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listarMovimientosInventarioPaginado } from '../../../services/inventory/inventoryService';


export const useInventoryStockMovements = ({
  varianteId,
  almacenId,
  enabled = true,
  pageNumber = 1,
  pageSize = 10,
}) => {
  // Query para listar movimientos
  return useQuery({
    queryKey: ['inventoryStockMovements', varianteId, almacenId, pageNumber, pageSize],
    queryFn: () => listarMovimientosInventarioPaginado({
      varianteId,
      almacenId,
      pageNumber,
      pageSize,
    }),
    enabled: Boolean(enabled && varianteId && almacenId),
    placeholderData: keepPreviousData,
  });
};