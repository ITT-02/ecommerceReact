// Servicio CRUD de variantes de producto.
// Aquí vive precio, medidas, color y stock mínimo.

import { restApi } from '../../api/restApi';

export const getVariants = async (productId = null) => {
  const params = {
    select: '*,productos(id,nombre)',
    order: 'created_at.desc',
  };

  if (productId) params.producto_id = `eq.${productId}`;

  const response = await restApi.get('/producto_variantes', { params });
  return response.data;
};

export const createVariant = async (variant) => {
  const response = await restApi.post('/producto_variantes', variant, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const updateVariant = async (id, variant) => {
  const response = await restApi.patch('/producto_variantes', variant, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const deleteVariant = async (id) => {
  const response = await restApi.delete('/producto_variantes', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
