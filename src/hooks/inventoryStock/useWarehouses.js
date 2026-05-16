// src/hooks/inventoryStock/useWarehouses.js
import { useQuery } from '@tanstack/react-query';
import { restApi } from '../../api/restApi';

export const useWarehouses = () => {
  const query = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => {
      const response = await restApi.get('/almacenes', {
        params: {
          select: 'id,nombre',
          es_activo: 'eq.true',
          order: 'nombre.asc',
        },
      });
      return response.data || [];
    },
    staleTime: 1000 * 60 * 10, // Cachear por 10 minutos
  });

  return { 
    warehouses: query.data ?? [], 
    loading: query.isLoading 
  };
};