import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileStoreService } from '../../services/store/profileStoreService';


const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || null;

export const useStoreProfile = () => {
  const queryClient = useQueryClient();

  // Queries (lecturas)
  const profileQuery = useQuery({
    queryKey: ['myProfile'],
    queryFn: profileStoreService.getMiPerfil,
    staleTime: 5 * 60 * 1000 // Mantener caché 5 minutos
  });

  const addressesQuery = useQuery({
    queryKey: ['myAddresses'],
    queryFn: profileStoreService.getMisDirecciones,
  });

  // Mutations (escrituras)
  const updateProfileMutation = useMutation({
    mutationFn: profileStoreService.updateMiPerfil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    }
  });

  const createAddressMutation = useMutation({
    mutationFn: profileStoreService.createMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: profileStoreService.updateMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    }
  });

  const setMainAddressMutation = useMutation({
    mutationFn: profileStoreService.marcarDireccionPrincipal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: profileStoreService.eliminarMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    }
  });

  return {
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    addresses: addressesQuery.data || [],
    isLoadingAddresses: addressesQuery.isLoading,
    createAddress: createAddressMutation.mutateAsync,
    updateAddress: updateAddressMutation.mutateAsync,
    setMainAddress: setMainAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
  };
};