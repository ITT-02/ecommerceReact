// Servicio para promociones.
import { restApi } from '../../api/restApi';

const normalizePromotionPayload = (promotionData) => {
  return {
    p_promocion: promotionData?.p_promocion ?? promotionData ?? {},
    p_aplicaciones: promotionData?.p_aplicaciones ?? [],
  };
};

export const getPromotions = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
  tipo_promocion = null,
  tipo_descuento = null,
  fecha_inicio = null,
  fecha_fin = null,
  estado_calculado = null,
}) => {
  const response = await restApi.post('/rpc/listar_promociones_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_tipo_promocion: tipo_promocion,
    p_tipo_descuento: tipo_descuento,
    p_es_activa: esActivo,
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin,
    p_estado_calculado: estado_calculado,
  });

  return response.data;
};

export const getPromotionById = async (id) => {
  const response = await restApi.post('/rpc/obtener_promocion_admin_detalle', {
    p_promocion_id: id,
  });

  return response.data ?? null;
};

export const createPromotion = async (promotionData) => {
  const response = await restApi.post(
    '/rpc/crear_promocion_admin',
    normalizePromotionPayload(promotionData)
  );

  return response.data ?? null;
};

export const updatePromotion = async (id, promotionData) => {
  const payload = normalizePromotionPayload(promotionData);

  const response = await restApi.post('/rpc/actualizar_promocion_admin', {
    p_promocion_id: id,
    ...payload,
  });

  return response.data ?? null;
};

export const deletePromotion = async (id) => {
  const response = await restApi.post('/rpc/eliminar_promocion_admin', {
    p_promocion_id: id,
  });

  return response.data ?? null;
};

export const changePromotionStatus = async (id, esActiva) => {
  const response = await restApi.post('/rpc/cambiar_estado_promocion_admin', {
    p_promocion_id: id,
    p_es_activa: Boolean(esActiva),
  });

  return response.data ?? null;
};
