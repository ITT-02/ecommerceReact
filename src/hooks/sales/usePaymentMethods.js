// Hook para métodos de pago (CRUD)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '../../services/sales/paymentMethodService';

const QUERY_KEY = ['payment-methods'];

export const usePaymentMethods = (onlyActive = false) => {
  return useQuery({
    queryKey: [...QUERY_KEY, { onlyActive }],
    queryFn: () => getPaymentMethods(onlyActive),
  });
};

export const usePaymentMethod = (id) => {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => getPaymentMethodById(id),
    enabled: !!id,
  });
};

export const usePaymentMethodsMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updatePaymentMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    createMethod: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    errorCreating: createMutation.error,

    updateMethod: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    errorUpdating: updateMutation.error,

    deleteMethod: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    errorDeleting: deleteMutation.error,
  };
};
