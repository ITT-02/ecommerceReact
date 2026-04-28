// Servicio del catálogo público de la tienda.

import { restApi } from '../../api/restApi';

export const getPublicCatalog = async () => {
  const response = await restApi.get('/vw_catalogo_publico', {
    params: {
      select: '*',
      order: 'producto_nombre.asc',
    },
  });

  return response.data;
};

export const getPublicProductDetailBySlug = async (slug) => {
  const response = await restApi.get('/vw_detalle_producto', {
    params: {
      producto_slug: `eq.${slug}`,
      select: '*',
    },
  });

  return response.data;
};
