import { restApi } from '../../api/restApi';

const normalizePaginatedResponse = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? [];
  const totalCount = Number(value?.totalCount ?? items.length);
  const currentPage = Number(value?.pageNumber ?? pageNumber);
  const currentPageSize = Number(value?.pageSize ?? pageSize);
  const totalPages = Number(
    value?.totalPages ?? Math.max(Math.ceil(totalCount / Math.max(currentPageSize, 1)), 1)
  );

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
};

const normalizeRpcJson = (data, fallback = null) => {
  if (Array.isArray(data) && data.length === 1 && !data[0]?.id && typeof data[0] === 'object') {
    return data[0];
  }

  return data ?? fallback;
};

const normalizeRpcArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const listWholesaleRequests = async ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  search = '',
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_solicitudes_mayoristas', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_estado: estado || null,
    p_search: search || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizePaginatedResponse(response.data, pageNumber, pageSize);
};

export const reviewWholesaleRequest = async ({ requestId, action, comment = '' }) => {
  const response = await restApi.post('/rpc/revisar_solicitud_mayorista', {
    p_solicitud_id: requestId,
    p_accion: action,
    p_comentario_revision: comment || null,
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const listWholesaleVariantOptions = async (search = '') => {
  const response = await restApi.post('/rpc/listar_variantes_con_atributos_paginado', {
    p_page_number: 1,
    p_page_size: 25,
    p_search: search || null,
    p_producto_id: null,
    p_es_activa: true,
  });

  const value = Array.isArray(response.data) ? response.data[0] : response.data;
  return value?.items || value?.variantes || [];
};

export const listWholesaleTiers = async (variantId) => {
  if (!variantId) return [];

  const response = await restApi.post('/rpc/listar_tramos_mayoristas_variante_admin', {
    p_variante_id: variantId,
  });

  return normalizeRpcArray(response.data);
};

export const listWholesaleTiersAdmin = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_tramos_mayoristas_admin', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizePaginatedResponse(response.data, pageNumber, pageSize);
};

export const saveWholesaleTier = async ({ tierId = null, varianteId, cantidadMinima, precioUnitario, esActivo = true }) => {
  const response = await restApi.post('/rpc/guardar_tramo_mayorista_admin', {
    p_tramo_id: tierId || null,
    p_variante_id: varianteId,
    p_cantidad_minima: Number(cantidadMinima),
    p_precio_unitario: Number(precioUnitario),
    p_es_activo: Boolean(esActivo),
  });

  return normalizeRpcJson(response.data);
};

export const deleteWholesaleTier = async (tierId) => {
  if (!tierId) return false;

  const response = await restApi.post('/rpc/eliminar_tramo_mayorista_admin', {
    p_tramo_id: tierId,
  });

  return Boolean(response.data);
};

export const replaceWholesaleTiersForVariant = async (variantId, tiers = []) => {
  if (!variantId) return [];

  const normalizedTiers = tiers
    .map((tier) => ({
      cantidad_minima: Number(tier.cantidad_minima ?? tier.cantidadMinima ?? 0),
      precio_unitario: Number(tier.precio_unitario ?? tier.precioUnitario ?? 0),
      es_activo: tier.es_activo ?? tier.esActivo ?? true,
    }))
    .filter((tier) => tier.cantidad_minima > 0 && tier.precio_unitario >= 0)
    .sort((a, b) => a.cantidad_minima - b.cantidad_minima);

  const response = await restApi.post('/rpc/reemplazar_tramos_mayoristas_variante_admin', {
    p_variante_id: variantId,
    p_tramos: normalizedTiers,
  });

  return normalizeRpcArray(response.data);
};
