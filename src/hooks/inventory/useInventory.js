// Hook para inventario y alertas de stock.

import { useQuery } from '@tanstack/react-query';
import { getInventory, getStockAlerts } from '../../services/inventory/inventoryService';

export const useInventory = () => {
  const inventoryQuery = useQuery({ queryKey: ['inventory'], queryFn: getInventory });
  const alertsQuery = useQuery({ queryKey: ['stock-alerts'], queryFn: getStockAlerts });

  return {
    inventory: inventoryQuery.data ?? [],
    alerts: alertsQuery.data ?? [],
    loading: inventoryQuery.isLoading,
    error: inventoryQuery.error?.message ?? null,
  };
};
