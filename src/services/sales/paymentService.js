// Ruta sugerida: src/services/sales/paymentService.js
import { restApi } from '../../api/restApi';

// 1. Listar pagos paginados
export const getAdminPayments = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
  metodoPago = null,
  pedidoId = null,
  fechaInicio = null,
  fechaFin = null
}) => {
  const response = await restApi.post('/rpc/listar_pagos_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado: estado,
    p_metodo_pago: metodoPago,
    p_pedido_id: pedidoId,
    p_fecha_inicio: fechaInicio,
    p_fecha_fin: fechaFin
  });
  return response.data;
};

// 2. Obtener detalle de pago e historial
export const getAdminPaymentDetail = async (pagoId) => {
  const response = await restApi.post('/rpc/obtener_pago_admin_detalle', {
    p_pago_id: pagoId
  });
  return response.data;
};

// 3. Cambiar el estado del pago
export const changePaymentStatus = async ({ pagoId, estadoNuevo, comentario }) => {
  const response = await restApi.post('/rpc/cambiar_estado_pago_admin', {
    p_pago_id: pagoId,
    p_estado_nuevo: estadoNuevo,
    p_comentario: comentario || null
  });
  return response.data;
};

// 4. Obtener detalle del pedido relacionado
export const getAdminRelatedOrder = async (pedidoId) => {
  const response = await restApi.post('/rpc/obtener_pedido_admin_detalle', {
    p_pedido_id: pedidoId
  });
  return response.data;
};