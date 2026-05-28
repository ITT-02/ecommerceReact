import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    tipo_promocion = null,
    tipo_descuento = null,
    fecha_inicio = null,
    fecha_fin = null,
  } = {}) => {
  const queryClient = useQueryClient();

  const promotionsQuery = useQuery({
    queryKey: [
      'promotions',
      pageNumber,
      pageSize,
      search,
      esActivo,
      tipo_promocion,
      tipo_descuento,
      fecha_inicio,
      fecha_fin,
    ],
    queryFn: () =>
      getPromotions({
        pageNumber,
        pageSize,
        search,
        esActivo,
        tipo_promocion,
        tipo_descuento,
        fecha_inicio,
        fecha_fin,
      }),
    placeholderData: keepPreviousData,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, promotion }) => {
      if (id) return updatePromotion(id, promotion);
      return createPromotion(promotion);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  });

  const deleteMutation = useMutation({
      mutationFn: deletePromotion,
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
    fetching: promotionsQuery.isFetching,
    error: promotionsQuery.error?.message ?? null,
    saving: saveMutation.isPending,
    deleting: deleteMutation.isPending,
    getPromotionById,
    savePromotion: (promotion, id = null) => saveMutation.mutateAsync({ id, promotion }),
    removePromotion: (id) => deleteMutation.mutateAsync(id),
  };
};