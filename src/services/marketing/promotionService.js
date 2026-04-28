// Servicio para promociones.

import { restApi } from '../../api/restApi';

export const getPromotions = async () => {
  const response = await restApi.get('/promociones', {
    params: { select: '*', order: 'created_at.desc' },
  });
  return response.data;
};

export const createPromotion = async (promotion) => {
  const response = await restApi.post('/promociones', promotion, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
