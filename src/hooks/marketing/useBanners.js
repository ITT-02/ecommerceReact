// Hook para administrar banners de la tienda.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from '../../services/marketing/bannerService';

const bannersQueryKey = ['banners'];

export const useBanners = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
} = {}) => {
  const queryClient = useQueryClient();

  const bannersQuery = useQuery({
    queryKey: [...bannersQueryKey, pageNumber, pageSize, search, esActivo],
    queryFn: () => getBanners({ pageNumber, pageSize, search, esActivo }),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, banner }) => {
      if (id) return updateBanner(id, banner);
      return createBanner(banner);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannersQueryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bannersQueryKey }),
  });

  return {
    banners: bannersQuery.data?.items ?? [],
    pagination: {
      totalCount: bannersQuery.data?.totalCount ?? 0,
      pageNumber: bannersQuery.data?.pageNumber ?? pageNumber,
      pageSize: bannersQuery.data?.pageSize ?? pageSize,
      totalPages: bannersQuery.data?.totalPages ?? 0,
      hasPreviousPage: bannersQuery.data?.hasPreviousPage ?? false,
      hasNextPage: bannersQuery.data?.hasNextPage ?? false,
    },
    loading: bannersQuery.isLoading,
    fetching: bannersQuery.isFetching,
    error: bannersQuery.error?.message || saveMutation.error?.message || deleteMutation.error?.message || null,
    saving: saveMutation.isPending,
    deleting: deleteMutation.isPending,
    getBannerById,
    saveBanner: (banner, id = null) => saveMutation.mutateAsync({ id, banner }),
    removeBanner: (id) => deleteMutation.mutateAsync(id),
  };
};
