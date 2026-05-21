import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminUsers,
  getAdminUserDetail,
  updateUserProfile,
  assignUserRoles,
  getRoleOptions,
} from '../../services/users/adminUserService';

export const useAdminUsers = (filters = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ['admin-users', filters];

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey,
    queryFn: () => getAdminUsers(filters),
    keepPreviousData: true,
  });

  const { mutateAsync: editProfile, isLoading: isEditingProfile } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-user-detail']);
    },
  });

  const { mutateAsync: assignRoles, isLoading: isAssigningRoles } = useMutation({
    mutationFn: assignUserRoles,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      queryClient.invalidateQueries(['admin-user-detail']);
    },
  });

  return {
    users: data?.items || [],
    pagination: {
      pageNumber: data?.pageNumber || 1,
      pageSize: data?.pageSize || 10,
      totalCount: data?.totalCount || 0,
      totalPages: data?.totalPages || 1,
    },
    isLoading: isLoading || isPlaceholderData,
    editProfile,
    isEditingProfile,
    assignRoles,
    isAssigningRoles,
  };
};

export const useAdminUserDetail = (usuarioId) => {
  return useQuery({
    queryKey: ['admin-user-detail', usuarioId],
    queryFn: () => getAdminUserDetail(usuarioId),
    enabled: !!usuarioId,
  });
};

export const useRoleOptions = () => {
  return useQuery({
    queryKey: ['admin-role-options'],
    queryFn: getRoleOptions,
    staleTime: 5 * 60 * 1000,
  });
};
