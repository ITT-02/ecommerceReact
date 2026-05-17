// Servicio para pedidos y seguimiento de compra.

import { restApi } from '../../api/restApi';
import { normalizeProductPaginatedResponse } from '../../adapters/catalog/productAdapter';
// Referencias a los meses actuales 
const hoy = new Date();
const year = hoy.getFullYear();
const month = hoy.getMonth();


export const createOrderFromCart = async ({ direccionId, metodoPago, notasCliente }) => {
  const response = await restApi.post('/rpc/crear_pedido_desde_carrito', {
    p_direccion_id: direccionId || null,
    p_metodo_pago: metodoPago || null,
    p_notas_cliente: notasCliente || null,
  });
  return response.data;
};
export const getOrders  = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estadoPedido = null,
  estadoPago = null,
  fechaInicio =  new Date(year,month,1).toISOString().split('T')[0],
  fechaFin = new Date(year,month+1,0).toISOString().split('T')[0],
}) => {
  const response = await restApi.post('/rpc/listar_pedidos_admin_paginado',{
    p_page_number : pageNumber,
    p_page_size : pageSize,
    p_search: search,
    p_estado_pedido: estadoPedido,
    p_estado_pago: estadoPago,
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin,
  })
  return normalizeProductPaginatedResponse(response.data,pageNumber,pageSize)
}

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
