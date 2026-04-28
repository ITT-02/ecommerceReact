// Hook para pagos.

import { useQuery } from '@tanstack/react-query';
import { getPayments } from '../services/paymentService';

export const usePayments = () => {
  const paymentsQuery = useQuery({ 
    queryKey: ['payments'], 
    queryFn: getPayments });

  return {
    payments: paymentsQuery.data ?? [],
    loading: paymentsQuery.isLoading,
    error: paymentsQuery.error?.message ?? null,
  };
};
