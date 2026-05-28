// Hook genérico para tablas administrativas simples.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listResource, patchResource, upsertResource } from '../../services/admin/genericResourceService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useResourceTable = ({
  queryKey,
  table,
  select = '*',
  pageNumber = 1,
  pageSize = 10,
  search = '',
  searchColumns = [],
  filters = {},
  order = 'created_at.desc',
}) => {
  const queryClient = useQueryClient();
  const baseKey = Array.isArray(queryKey) ? queryKey : [queryKey || table];

  const query = useQuery({
    queryKey: [...baseKey, pageNumber, pageSize, search, filters],
    queryFn: () =>
      listResource({ table, select, pageNumber, pageSize, search, searchColumns, filters, order }),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => upsertResource({ table, data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: baseKey }),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }) => patchResource({ table, id, data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: baseKey }),
  });

  return {
    rows: query.data?.items ?? [],
    pagination: {
      totalCount: query.data?.totalCount ?? 0,
      pageNumber: query.data?.pageNumber ?? pageNumber,
      pageSize: query.data?.pageSize ?? pageSize,
      totalPages: query.data?.totalPages ?? 0,
      hasPreviousPage: query.data?.hasPreviousPage ?? false,
      hasNextPage: query.data?.hasNextPage ?? false,
    },
    loading: query.isLoading,
    fetching: query.isFetching,
    error: getErrorMessage(query.error) || getErrorMessage(saveMutation.error) || getErrorMessage(patchMutation.error),
    saving: saveMutation.isPending || patchMutation.isPending,
    save: (data) => saveMutation.mutateAsync(data),
    patch: (id, data) => patchMutation.mutateAsync({ id, data }),
  };
};
