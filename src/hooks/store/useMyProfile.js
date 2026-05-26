import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../../services/store/profileService';

export const useMyProfile = () => {
  const queryClient = useQueryClient();

  // Queries (lecturas)
  const profileQuery = useQuery({
    queryKey: ['myProfile'],
    queryFn: profileService.getMiPerfil,
    staleTime: 5 * 60 * 1000 // Mantener caché 5 minutos
  });

  const addressesQuery = useQuery({
    queryKey: ['myAddresses'],
    queryFn: profileService.getMisDirecciones,
  });

  // Mutations (escrituras)
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateMiPerfil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    }
  });

  const createAddressMutation = useMutation({
    mutationFn: profileService.createMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: profileService.updateMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    }
  });

  const setMainAddressMutation = useMutation({
    mutationFn: profileService.marcarDireccionPrincipal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: profileService.eliminarMiDireccion,
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