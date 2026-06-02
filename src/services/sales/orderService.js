// Servicio administrativo para pedidos.
// Mantiene separados: estado operativo, pago, cancelación, reapertura y reembolso.

import { restApi } from '../../api/restApi';
import {
  normalizeOrderDetail,
  normalizeOrdersPaginatedResponse,
} from '../../adapters/orderAdapter';

export const syncCommercialExpirations = async () => {
  const response = await restApi.post('/rpc/sincronizar_vencimientos_comerciales', {});
  return response.data;
};

export const getOrders = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estadoPedido = null,
  estadoPago = null,
  fechaInicio = null,
  fechaFin = null,
}) => {
  const response = await restApi.post('/rpc/listar_pedidos_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado_pedido: estadoPedido || null,
    p_estado_pago: estadoPago || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizeOrdersPaginatedResponse(response.data, pageNumber, pageSize);
};

export const getOrderDetail = async (id) => {
  const response = await restApi.post('/rpc/obtener_pedido_admin_detalle', {
    p_pedido_id: id,
  });

  const detail = Array.isArray(response.data) ? response.data[0] : response.data;
  return normalizeOrderDetail(detail || {});
};

export const changeOrderStatus = async ({ pedidoId, estadoNuevo, comentario }) => {
  const response = await restApi.post('/rpc/cambiar_estado_pedido', {
    p_pedido_id: pedidoId,
    p_estado_nuevo: estadoNuevo,
    p_comentario: comentario || null,
  });

  return response.data;
};

export const cancelOrderAdmin = async ({ pedidoId, motivo, comentario }) => {
  const response = await restApi.post('/rpc/cancelar_pedido_admin', {
    p_pedido_id: pedidoId,
    p_motivo: motivo,
    p_comentario: comentario || null,
  });

  return response.data;
};

export const reopenOrderAdmin = async ({ pedidoId, motivo, nuevaFechaLimitePago }) => {
  const response = await restApi.post('/rpc/reabrir_pedido_admin', {
    p_pedido_id: pedidoId,
    p_motivo: motivo,
    p_nueva_fecha_limite_pago: nuevaFechaLimitePago || null,
  });

  return response.data;
};

export const registerOrderRefundAdmin = async ({
  pedidoId,
  pagoId,
  monto,
  metodoReembolso,
  referenciaReembolso,
  motivo,
}) => {
  const response = await restApi.post('/rpc/registrar_reembolso_pedido_admin', {
    p_pedido_id: pedidoId,
    p_pago_id: pagoId || null,
    p_monto: Number(monto || 0),
    p_metodo_reembolso: metodoReembolso,
    p_referencia_reembolso: referenciaReembolso || null,
    p_motivo: motivo,
  });

  return response.data;
};


export const registerShipmentTrackingAdmin = async ({
  pedidoId,
  transportistaId,
  empresaEnvio,
  numeroSeguimiento,
  urlSeguimiento,
  estadoEnvio,
  comentario,
}) => {
  const response = await restApi.post('/rpc/registrar_seguimiento_pedido_admin', {
    p_pedido_id: pedidoId,
    p_transportista_id: transportistaId || null,
    p_empresa_envio: empresaEnvio || null,
    p_numero_seguimiento: numeroSeguimiento || null,
    p_url_seguimiento: urlSeguimiento || null,
    p_estado_envio: estadoEnvio || 'entregado_repartidora',
    p_comentario: comentario || null,
  });

  return response.data;
};
