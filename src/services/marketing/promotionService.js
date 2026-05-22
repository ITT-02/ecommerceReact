// Servicio para promociones.
import { restApi } from '../../api/restApi';


export const getPromotions = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
}) => {
  const response = await restApi.post('/rpc/listar_promociones_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_tipo_promocion: null,
    p_tipo_descuento: null,
    p_es_activa: esActivo,
    p_fecha_inicio: null,
    p_fecha_fin: null
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
  console.log('Datos enviados para actualización:', { p_promocion_id: id, ...promotionData });
  const response = await restApi.post('/rpc/actualizar_promocion_admin', promotionData, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  console.log('Respuesta de actualización:', response.data);
  return response.data[0] || null;
};

export const deletePromotion = async (id) => {
  const response = await restApi.delete('/rpc/eliminar_promocion_admin', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  
  return response.data[0] || null;
};
