// Servicio administrativo para cotizaciones.

import { restApi } from '../../api/restApi';

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

export const getAdminQuotes = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_cotizaciones_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado: estado || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const getAdminQuoteDetail = async (id) => {
  const response = await restApi.post('/rpc/obtener_cotizacion_admin_detalle', {
    p_cotizacion_id: id,
  });

  return response.data || null;
};

export const respondAdminQuote = async ({
  cotizacionId,
  items = [],
  respuestaAdmin = '',
  descuento = 0,
  costoEnvio = 0,
  vigenciaDias = 7,
  comentarioInterno = '',
}) => {
  const response = await restApi.post('/rpc/responder_cotizacion_admin', {
    p_cotizacion_id: cotizacionId,
    p_items: items,
    p_respuesta_admin: respuestaAdmin || null,
    p_descuento: Number(descuento) || 0,
    p_costo_envio: Number(costoEnvio) || 0,
    p_vigencia_dias: Number(vigenciaDias) || 7,
    p_comentario_interno: comentarioInterno || null,
  });

  return response.data;
};

export const changeAdminQuoteStatus = async ({
  cotizacionId,
  estadoNuevo,
  comentario = '',
}) => {
  const response = await restApi.post('/rpc/cambiar_estado_cotizacion_admin', {
    p_cotizacion_id: cotizacionId,
    p_estado_nuevo: estadoNuevo,
    p_comentario: comentario || null,
  });

  return response.data;
};
