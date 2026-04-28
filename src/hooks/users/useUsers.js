// Hook para usuarios del sistema.

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../services/userService';

export const useUsers = () => {
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: getUsers });

  return {
    users: usersQuery.data ?? [],
    loading: usersQuery.isLoading,
    error: usersQuery.error?.message ?? null,
  };
};
