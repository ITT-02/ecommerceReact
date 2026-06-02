// Servicios de logística: transportistas y seguimiento de pedidos.

import { restApi } from '../../api/restApi';
import { normalizeOrdersPaginatedResponse } from '../../adapters/orderAdapter';

const normalizePaginated = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? value?.data ?? value?.registros ?? (Array.isArray(value) ? value : []);
  const totalCount = value?.totalCount ?? value?.total_count ?? value?.total ?? items.length;
  const currentPage = value?.pageNumber ?? value?.page_number ?? pageNumber;
  const currentPageSize = value?.pageSize ?? value?.page_size ?? pageSize;
  const totalPages =
    value?.totalPages ??
    value?.total_pages ??
    Math.max(Math.ceil(totalCount / Math.max(currentPageSize, 1)), 1);

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: value?.hasPreviousPage ?? value?.has_previous_page ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? value?.has_next_page ?? currentPage < totalPages,
  };
};

export const getShipments = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estadoEnvio = null,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_envios_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado_envio: estadoEnvio || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizeOrdersPaginatedResponse(response.data, pageNumber, pageSize);
};

export const registerShipmentTracking = async ({
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

export const getCarriers = async ({ pageNumber = 1, pageSize = 10, search = '', esActivo = null } = {}) => {
  const params = {
    select: 'id,nombre,telefono,correo,url_rastreo_base,notas,es_activo,created_at,updated_at',
    order: 'nombre.asc',
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  };

  if (esActivo !== null && esActivo !== '') params.es_activo = `eq.${esActivo}`;
  if (search?.trim()) {
    const value = search.trim();
    params.or = `(nombre.ilike.*${value}*,telefono.ilike.*${value}*,correo.ilike.*${value}*)`;
  }

  const response = await restApi.get('/transportistas', {
    params,
    headers: { Prefer: 'count=exact' },
  });

  const totalCount = Number(response.headers?.['content-range']?.split('/')?.[1] || response.data?.length || 0);
  return normalizePaginated({ items: response.data ?? [], totalCount, pageNumber, pageSize }, pageNumber, pageSize);
};

export const getCarrierOptions = async () => {
  const response = await restApi.get('/transportistas', {
    params: {
      select: 'id,nombre,telefono,correo,url_rastreo_base,es_activo',
      es_activo: 'eq.true',
      order: 'nombre.asc',
    },
  });

  return response.data || [];
};

export const saveCarrier = async (carrier) => {
  const payload = {
    nombre: carrier.nombre?.trim(),
    telefono: carrier.telefono?.trim() || null,
    correo: carrier.correo?.trim() || null,
    url_rastreo_base: carrier.url_rastreo_base?.trim() || null,
    notas: carrier.notas?.trim() || null,
    es_activo: Boolean(carrier.es_activo),
  };

  if (carrier.id) {
    const response = await restApi.patch('/transportistas', payload, {
      params: { id: `eq.${carrier.id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    });
    return response.data?.[0] || null;
  }

  const response = await restApi.post('/transportistas', payload, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data?.[0] || null;
};

export const updateCarrierStatus = async ({ id, esActivo }) => {
  const response = await restApi.patch('/transportistas', { es_activo: Boolean(esActivo) }, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data?.[0] || null;
};
