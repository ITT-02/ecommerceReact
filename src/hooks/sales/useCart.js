// Hook para carrito.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addItemToCart, getActiveCart, removeCartItem, updateCartItem } from '../services/cartService';

export const useCart = () => {
  const queryClient = useQueryClient();
  const cartQuery = useQuery({ queryKey: ['cart'], queryFn: getActiveCart });

  const addMutation = useMutation({
    mutationFn: addItemToCart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, cantidad }) => updateCartItem(itemId, cantidad),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  return {
    cart: cartQuery.data,
    loading: cartQuery.isLoading,
    error: cartQuery.error?.message ?? null,
    addItem: addMutation.mutateAsync,
    updateItem: updateMutation.mutateAsync,
    removeItem: removeMutation.mutateAsync,
  };
};
