import { useQuery } from '@tanstack/react-query';
import { getActivesWarehouses } from '../../../services/inventory/inventoryService'; 

export const useWarehouses = () => {
  // Query para listar almacenes
  const query = useQuery({
    queryKey: ['warehouses', 'actives'],
    queryFn: getActivesWarehouses,
    staleTime: 1000 * 60 * 10, // Cache de 10 minutos
  });

  return { 
    warehouses: query.data ?? [], 
    loading: query.isLoading 
  };
};