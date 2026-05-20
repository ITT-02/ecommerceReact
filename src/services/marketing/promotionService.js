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
  const response = await restApi.get('/promociones', {
    params: { id: `eq.${id}`, select: '*', limit: 1 },
  });

  return response.data[0] || null;
};

export const createPromotion = async (promotionData) => {
  const response = await restApi.post('/promociones', promotionData, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const updatePromotion = async (id, promotionData) => {
  const response = await restApi.patch('/promociones', promotionData, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const deletePromotion = async (id) => {
  const response = await restApi.delete('/promociones', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  
  return response.data[0] || null;
};
