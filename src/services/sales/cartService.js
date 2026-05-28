// Servicio para carrito de compras.
// Usa RPC para respetar stock, venta bajo pedido y reglas comerciales.

import { restApi } from '../../api/restApi';

export const createOrGetActiveCart = async () => {
  const response = await restApi.post('/rpc/crear_o_recuperar_carrito_activo', {});
  return response.data;
};

export const getActiveCart = async () => {
  const response = await restApi.post('/rpc/obtener_carrito_actual', {});
  return response.data || { items: [], subtotal: 0, total: 0 };
};

export const addItemToCart = async ({ varianteId, cantidad }) => {
  const response = await restApi.post('/rpc/agregar_item_a_carrito', {
    p_variante_id: varianteId,
    p_cantidad: cantidad,
  });
  return response.data;
};

export const updateCartItem = async (itemId, cantidad) => {
  const response = await restApi.post('/rpc/actualizar_item_carrito', {
    p_item_id: itemId,
    p_cantidad: cantidad,
  });
  return response.data;
};

export const removeCartItem = async (itemId) => {
  const response = await restApi.post('/rpc/eliminar_item_carrito', {
    p_item_id: itemId,
  });
  return response.data;
};
