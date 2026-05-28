// Servicios de pedidos del cliente.
// Checkout, listado, detalle, métodos de pago y comprobantes.

import { restApi } from '../../api/restApi';
import { uploadFile } from '../filesService';

const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
const PAYMENT_PROOFS_FOLDER = 'comprobantes';

const normalizePaginated = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? [];
  const totalCount = value?.totalCount ?? items.length;
  const currentPage = value?.pageNumber ?? pageNumber;
  const currentPageSize = value?.pageSize ?? pageSize;
  const totalPages = Math.max(Math.ceil(totalCount / Math.max(currentPageSize, 1)), 1);

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages: value?.totalPages ?? totalPages,
    hasPreviousPage: value?.hasPreviousPage ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? currentPage < totalPages,
  };
};

export const syncCommercialExpirations = async () => {
  const response = await restApi.post('/rpc/sincronizar_vencimientos_comerciales', {});
  return response.data;
};

export const getActiveStorePaymentMethods = async () => {
  const response = await restApi.get('/metodos_pago', {
    params: {
      select:
        'id,codigo,nombre,tipo,moneda,titular,numero_cuenta,telefono,instrucciones,imagen_url,imagen_path,orden_visual,es_activo',
      es_activo: 'eq.true',
      order: 'orden_visual.asc,nombre.asc',
    },
  });

  return response.data ?? [];
};

export const createOrderFromCart = async ({ direccionId, metodoPago, notasCliente }) => {
  const response = await restApi.post('/rpc/crear_pedido_desde_carrito', {
    p_direccion_id: direccionId || null,
    p_metodo_pago: metodoPago || null,
    p_notas_cliente: notasCliente || null,
  });

  return response.data;
};

export const getMyOrdersPaginated = async ({
  pageNumber = 1,
  pageSize = 10,
  estadoPedido = null,
  estadoPago = null,
  estadoEnvio = null,
} = {}) => {
  await syncCommercialExpirations();

  const response = await restApi.post('/rpc/listar_mis_pedidos_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_estado_pedido: estadoPedido,
    p_estado_pago: estadoPago,
    p_estado_envio: estadoEnvio,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const getMyOrderDetail = async (id) => {
  await syncCommercialExpirations();

  const response = await restApi.post('/rpc/obtener_mi_pedido_detalle', {
    p_pedido_id: id,
  });

  return response.data || null;
};

export const registerOrderPayment = async ({
  pedidoId,
  metodoPago,
  monto,
  comprobanteFile,
  referenciaTransaccion,
}) => {
  if (!pedidoId) throw new Error('No se recibió el pedido.');
  if (!metodoPago) throw new Error('Selecciona un método de pago.');

  let uploadedProof = null;

  if (comprobanteFile) {
    uploadedProof = await uploadFile({
      bucket: PAYMENT_PROOFS_BUCKET,
      folder: `${PAYMENT_PROOFS_FOLDER}/${pedidoId}`,
      file: comprobanteFile,
    });
  }

  const response = await restApi.post('/rpc/registrar_pago_pedido', {
    p_pedido_id: pedidoId,
    p_metodo_pago: metodoPago,
    p_monto: Number(monto || 0),
    p_url_comprobante: uploadedProof?.url || null,
    p_referencia_transaccion: referenciaTransaccion || null,
  });

  return response.data;
};
