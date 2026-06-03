import { useQuery } from '@tanstack/react-query';

import {
  getStoreActivePromotions,
  getStoreBanners,
} from '../../services/store/storeCatalogService';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  null;

export const useStoreMarketing = () => {
  const bannersQuery = useQuery({
    queryKey: ['store-banners-public'],
    queryFn: getStoreBanners,
    staleTime: 1000 * 60 * 10,
  });

  const promotionsQuery = useQuery({
    queryKey: ['store-promotions-public'],
    queryFn: () => getStoreActivePromotions({ limit: 6 }),
    staleTime: 1000 * 60 * 10,
  });

  return {
    banners: bannersQuery.data ?? [],
    promotions: promotionsQuery.data ?? [],
    loading: bannersQuery.isLoading || promotionsQuery.isLoading,
    error: getErrorMessage(bannersQuery.error) || getErrorMessage(promotionsQuery.error),
  };
};
