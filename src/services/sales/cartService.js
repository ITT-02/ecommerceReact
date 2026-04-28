// Servicio para carrito de compras.
// Usa funciones RPC para respetar reglas de negocio del backend externo.

import { restApi } from '../../api/restApi';

export const createOrGetActiveCart = async () => {
  const response = await restApi.post('/rpc/crear_o_recuperar_carrito_activo', {});
  return response.data;
};

export const getActiveCart = async () => {
  const response = await restApi.get('/carritos', {
    params: {
      estado: 'eq.activo',
      select: '*,carrito_items(*,producto_variantes(*,productos(id,nombre,slug)))',
      order: 'created_at.desc',
      limit: 1,
    },
  });

  return response.data[0] || null;
};

export const addItemToCart = async ({ varianteId, cantidad }) => {
  const response = await restApi.post('/rpc/agregar_item_a_carrito', {
    p_variante_id: varianteId,
    p_cantidad: cantidad,
  });
  return response.data;
};

export const updateCartItem = async (itemId, cantidad) => {
  const response = await restApi.patch('/carrito_items', { cantidad }, {
    params: { id: `eq.${itemId}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const removeCartItem = async (itemId) => {
  const response = await restApi.delete('/carrito_items', {
    params: { id: `eq.${itemId}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
