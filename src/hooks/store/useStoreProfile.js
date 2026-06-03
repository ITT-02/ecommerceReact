import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileStoreService } from '../../services/store/profileStoreService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  'No se pudo cargar la información. Inténtalo nuevamente.';

export const useStoreProfile = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['myProfile'],
    queryFn: profileStoreService.getMiPerfil,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const addressesQuery = useQuery({
    queryKey: ['myAddresses'],
    queryFn: profileStoreService.getMisDirecciones,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const updateProfileMutation = useMutation({
    mutationFn: profileStoreService.updateMiPerfil,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });

  const createAddressMutation = useMutation({
    mutationFn: profileStoreService.createMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: profileStoreService.updateMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    },
  });

  const setMainAddressMutation = useMutation({
    mutationFn: profileStoreService.marcarDireccionPrincipal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: profileStoreService.eliminarMiDireccion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
    },
  });

  const profileError = profileQuery.isError ? getErrorMessage(profileQuery.error) : '';
  const addressesError = addressesQuery.isError ? getErrorMessage(addressesQuery.error) : '';

  return {
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,
    isErrorProfile: profileQuery.isError,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,

    addresses: addressesQuery.data || [],
    isLoadingAddresses: addressesQuery.isLoading,
    isErrorAddresses: addressesQuery.isError,
    createAddress: createAddressMutation.mutateAsync,
    updateAddress: updateAddressMutation.mutateAsync,
    setMainAddress: setMainAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,

    error: profileError || addressesError,
  };
};
