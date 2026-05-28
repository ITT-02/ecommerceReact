// Servicios para seguimiento de ventas gestionadas por vendedor.

import { restApi } from '../../api/restApi';
import { uploadFile } from '../filesService';

const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
const PAYMENT_PROOFS_FOLDER = 'cotizaciones-manuales';

const normalizePaginated = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? [];
  const totalCount = value?.totalCount ?? items.length;
  const currentPage = value?.pageNumber ?? pageNumber;
  const currentPageSize = value?.pageSize ?? pageSize;
  const totalPages = value?.totalPages ?? Math.max(Math.ceil(totalCount / currentPageSize), 1);

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: value?.hasPreviousPage ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? currentPage < totalPages,
  };
};

const uploadPaymentProof = async ({ cotizacionId, file }) => {
  if (!file) return null;

  return uploadFile({
    bucket: PAYMENT_PROOFS_BUCKET,
    folder: `${PAYMENT_PROOFS_FOLDER}/${cotizacionId}`,
    file,
  });
};

export const getSellerManualQuotes = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_cotizaciones_vendedor_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado: estado || null,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const getSellerManualSales = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estadoPago = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_ventas_manuales_vendedor_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado_pago: estadoPago || null,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const markManualQuoteCommunicated = async ({ cotizacionId, comentario = '' }) => {
  const response = await restApi.post('/rpc/registrar_comunicacion_cotizacion_manual_admin', {
    p_cotizacion_id: cotizacionId,
    p_comentario: comentario || null,
  });

  return response.data;
};

export const registerManualQuotePayment = async ({
  cotizacionId,
  metodoPago,
  estadoPago,
  referenciaTransaccion = '',
  comentario = '',
  comprobanteFile = null,
}) => {
  const uploadedProof = await uploadPaymentProof({ cotizacionId, file: comprobanteFile });

  const response = await restApi.post('/rpc/registrar_pago_cotizacion_manual_vendedor', {
    p_cotizacion_id: cotizacionId,
    p_pago: {
      metodo_pago: metodoPago || null,
      estado_pago: estadoPago || 'validando',
      referencia_transaccion: referenciaTransaccion || null,
      url_comprobante: uploadedProof?.url || null,
      comprobante_path: uploadedProof?.path || null,
    },
    p_comentario: comentario || null,
  });

  return response.data;
};
