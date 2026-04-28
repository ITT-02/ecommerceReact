// Servicio para multimedia de productos y variantes.

import { restApi } from '../../api/restApi';

export const getProductMedia = async (productId) => {
  const response = await restApi.get('/producto_multimedia', {
    params: { producto_id: `eq.${productId}`, select: '*', order: 'orden_visual.asc' },
  });
  return response.data;
};

export const createProductMedia = async (media) => {
  const response = await restApi.post('/producto_multimedia', media, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const deleteProductMedia = async (id) => {
  const response = await restApi.delete('/producto_multimedia', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
