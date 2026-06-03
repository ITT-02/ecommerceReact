import { useQuery } from '@tanstack/react-query';

import { getAdminAttentionCounters } from '../../services/admin/attentionService';

export const useAdminAttentionCounters = ({ enabled = true } = {}) => {
  const countersQuery = useQuery({
    queryKey: ['admin-attention-counters'],
    queryFn: getAdminAttentionCounters,
    enabled,
    staleTime: 1000 * 30,
    refetchInterval: enabled ? 1000 * 60 : false,
    retry: false,
  });

  return {
    counters: countersQuery.data || {},
    loading: enabled ? countersQuery.isLoading : false,
    error: enabled ? countersQuery.error?.message || null : null,
  };
};
