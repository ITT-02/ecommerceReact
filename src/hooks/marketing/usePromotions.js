import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  changePromotionStatus,
  createPromotion,
  deletePromotion,
  getPromotionById,
  getPromotions,
  updatePromotion,
} from '../../services/marketing/promotionService';
import { normalizeApiError } from '../../utils/api/normalizeApiError';

export const usePromotions = ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
  tipo_promocion = null,
  tipo_descuento = null,
  fecha_inicio = null,
  fecha_fin = null,
  estado_calculado = null,
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
      estado_calculado,
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
        estado_calculado,
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

  const statusMutation = useMutation({
    mutationFn: ({ id, esActiva }) => changePromotionStatus(id, esActiva),
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

    // Solo error del listado. Los errores de guardar/eliminar se manejan en la página.
    error: normalizeApiError(promotionsQuery.error),

    saving: saveMutation.isPending,
    deleting: deleteMutation.isPending,
    changingStatus: statusMutation.isPending,
    getPromotionById,
    savePromotion: (promotion, id = null) => saveMutation.mutateAsync({ id, promotion }),
    removePromotion: (id) => deleteMutation.mutateAsync(id),
    setPromotionStatus: (id, esActiva) => statusMutation.mutateAsync({ id, esActiva }),
  };
};
