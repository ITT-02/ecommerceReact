// Servicio para banners de la tienda.

import { restApi } from '../../api/restApi';

export const getBanners = async () => {
  const response = await restApi.get('/banners_home', {
    params: { select: '*', order: 'orden_visual.asc' },
  });
  return response.data;
};

export const createBanner = async (banner) => {
  const response = await restApi.post('/banners_home', banner, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
