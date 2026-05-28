import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAdminPayments, 
  changePaymentStatus, 
  getAdminPaymentDetail, 
  getAdminRelatedOrder,
  getPaymentMethodOptions
} from '../../services/sales/paymentService'; 

export const useAdminPayments = (filters = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['admin-payments', filters];

  // 1. Query para listar la tabla
  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey,
    queryFn: () => getAdminPayments(filters),
    keepPreviousData: true, 
  });

  // 2. Mutación para cambiar estados
  const { mutateAsync: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: changePaymentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payment-detail'] });
      queryClient.invalidateQueries({ queryKey: ['orders-admin'] }); 
    },
  });

  return {
    // 1. Extraemos de data.items en lugar de data.data
    pagos: data?.items || [], 
    
    // 2. Extraemos exactamente los nombres que devuelve tu base de datos
    pagination: {
      pageNumber: data?.pageNumber || 1,
      pageSize: data?.pageSize || 10,
      totalCount: data?.totalCount || 0,
      totalPages: data?.totalPages || 1,
    },
    
    isLoading: isLoading || isPlaceholderData,
    isError,
    error,
    updateStatus,
    isUpdating
  };
};

// 3. NUEVO EXPORT: Hook separado para leer un solo pago (con historial)
export const useAdminPaymentDetail = (pagoId) => {
  return useQuery({
    queryKey: ['admin-payment-detail', pagoId],
    queryFn: () => getAdminPaymentDetail(pagoId),
    enabled: !!pagoId, // Solo se ejecuta si le pasamos un ID válido
  });
};

// 4. NUEVO EXPORT: Hook separado para leer el pedido relacionado a un pago
export const useAdminRelatedOrder = (pedidoId) => {
  return useQuery({
    queryKey: ['admin-related-order', pedidoId],
    queryFn: () => getAdminRelatedOrder(pedidoId),
    enabled: !!pedidoId, 
  });
};

// 5.Carga los métodos de pago para filtros.

export const usePaymentMethodOptions = () => {
  return useQuery({
    queryKey: ['payment-method-options'],
    queryFn: getPaymentMethodOptions,
  });
};