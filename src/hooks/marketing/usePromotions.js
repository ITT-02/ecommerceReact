import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
} from '../../services/marketing/promotionService';

export const usePromotions = ({
    pageNumber = 1,
    pageSize = 10,
    search = '',
    esActivo = null,
  } = {}) => {
  const queryClient = useQueryClient();

  const promotionsQuery = useQuery({
    queryKey: ['promotions', pageNumber, pageSize, search, esActivo],
    queryFn: () => getPromotions({ pageNumber, pageSize, search, esActivo }),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, promotion }) => {
      if (id) return updatePromotion(id, promotion);
      return createPromotion(promotion);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });


  return {
    promotions: promotionsQuery.data?.items ?? [],
    pagination: {
        totalCount: promotionsQuery.data?.totalCount ?? 0,
        pageNumber: promotionsQuery.data?.pageNumber ?? pageNumber,
        pageSize: promotionsQuery.data?.pageSize ?? pageSize,
        totalPages: promotionsQuery.data?.totalPages ?? 0,
        hasPreviousPage: promotionsQuery.data?.hasPreviousPage ?? false,
        hasNextPage: promotionsQuery.data?.hasNextPage ?? false,
    },
    loading: promotionsQuery.isLoading,
    error: promotionsQuery.error?.message ?? null,
    savePromotion: (promotion, id = null) => saveMutation.mutateAsync({ id, promotion }),
  };
};