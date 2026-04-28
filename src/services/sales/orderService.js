// Servicio para pedidos y seguimiento de compra.

import { restApi } from '../../api/restApi';

export const createOrderFromCart = async ({ direccionId, metodoPago, notasCliente }) => {
  const response = await restApi.post('/rpc/crear_pedido_desde_carrito', {
    p_direccion_id: direccionId || null,
    p_metodo_pago: metodoPago || null,
    p_notas_cliente: notasCliente || null,
  });
  return response.data;
};

export const getMyOrders = async () => {
  const response = await restApi.get('/pedidos', {
    params: {
      select: '*,pedido_items(*),pedido_historial_estados(*)',
      order: 'created_at.desc',
    },
  });
  return response.data;
};

export const getAdminOrders = async () => {
  const response = await restApi.get('/pedidos', {
    params: {
      select: '*,perfiles(id,nombre_completo,telefono),pedido_items(*)',
      order: 'created_at.desc',
    },
  });
  return response.data;
};

export const changeOrderStatus = async ({ pedidoId, estadoNuevo, comentario }) => {
  const response = await restApi.post('/rpc/cambiar_estado_pedido', {
    p_pedido_id: pedidoId,
    p_estado_nuevo: estadoNuevo,
    p_comentario: comentario || null,
  });
  return response.data;
};
