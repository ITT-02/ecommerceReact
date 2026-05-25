// Servicio para promociones.
import { restApi } from '../../api/restApi';


export const getPromotions = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
  tipo_promocion = null,
  tipo_descuento = null,
  fecha_inicio = null,
  fecha_fin = null,
}) => {
  const response = await restApi.post('/rpc/listar_promociones_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_tipo_promocion: tipo_promocion,
    p_tipo_descuento: tipo_descuento,
    p_es_activa: esActivo,
    p_fecha_inicio: fecha_inicio,
    p_fecha_fin: fecha_fin
  });
  
  return response.data;
};

export const getPromotionById = async (id) => {
  const response = await restApi.post('/rpc/obtener_promocion_admin_detalle', {
    p_promocion_id: id
  });

  return response.data || null;
};

export const createPromotion = async (promotionData) => {
  const response = await restApi.post('/rpc/crear_promocion_admin', promotionData, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const updatePromotion = async (id, promotionData) => {
  const payload = {
    p_promocion_id: id,
    ...promotionData,
  };

  const response = await restApi.post('/rpc/actualizar_promocion_admin', payload);
  return response.data?.[0] ?? response.data ?? null;
};

export const deletePromotion = async (id) => {
  const response = await restApi.post('/rpc/eliminar_promocion_admin', {
    p_promocion_id: id
  });
  
  return response.data[0] || null;
};
