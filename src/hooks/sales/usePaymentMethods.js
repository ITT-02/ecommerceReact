// Hook para métodos de pago.

import { useQuery } from '@tanstack/react-query';
import { getPaymentMethods } from '../services/paymentMethodService';

export const usePaymentMethods = () => {
  const methodsQuery = useQuery({ 
    queryKey: ['payment-methods'], 
    queryFn: getPaymentMethods });

  return {
    paymentMethods: methodsQuery.data ?? [],
    loading: methodsQuery.isLoading,
    error: methodsQuery.error?.message ?? null,
  };
};
