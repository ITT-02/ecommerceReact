import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addItemToCart,
  getActiveCart,
  removeCartItem,
  updateCartItem,
} from '../../services/sales/cartService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useCart = () => {
  const queryClient = useQueryClient();

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: getActiveCart,
    retry: false,
  });

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: ['cart'] });

  const addMutation = useMutation({ mutationFn: addItemToCart, onSuccess: invalidateCart });
  const updateMutation = useMutation({ mutationFn: ({ itemId, cantidad }) => updateCartItem(itemId, cantidad), onSuccess: invalidateCart });
  const removeMutation = useMutation({ mutationFn: removeCartItem, onSuccess: invalidateCart });

  return {
    cart: cartQuery.data || { items: [], subtotal: 0, total: 0 },
    items: cartQuery.data?.items ?? [],
    loading: cartQuery.isLoading,
    fetching: cartQuery.isFetching,
    saving: addMutation.isPending || updateMutation.isPending || removeMutation.isPending,
    error: getErrorMessage(cartQuery.error) || getErrorMessage(addMutation.error) || getErrorMessage(updateMutation.error) || getErrorMessage(removeMutation.error),
    addItem: async (payload) => addMutation.mutateAsync(payload),
    updateItem: async (itemId, cantidad) => updateMutation.mutateAsync({ itemId, cantidad }),
    removeItem: async (itemId) => removeMutation.mutateAsync(itemId),
  };
};
