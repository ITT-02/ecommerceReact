// Servicios de tienda: catálogo, detalle de producto, filtros, banners y promociones públicas.
import { restApi } from '../../api/restApi';

const normalizePaginated = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? [];
  const totalCount = Number(value?.totalCount ?? items.length);
  const currentPage = Number(value?.pageNumber ?? pageNumber);
  const currentPageSize = Number(value?.pageSize ?? pageSize);
  const totalPages = Number(value?.totalPages ?? Math.max(Math.ceil(totalCount / Math.max(currentPageSize, 1)), 1));

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    hasPreviousPage: value?.hasPreviousPage ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? currentPage < totalPages,
  };
};

export const getStoreCategories = async () => {
  const response = await restApi.post('/rpc/listar_categorias_tienda', {});
  return Array.isArray(response.data) ? response.data : [];
};

export const getStoreCatalogFilters = async () => {
  const response = await restApi.post('/rpc/listar_filtros_catalogo_tienda', {});
  return response.data || {};
};

export const getStoreBanners = async () => {
  const response = await restApi.post('/rpc/listar_banners_tienda_publicos', {});
  return Array.isArray(response.data) ? response.data : [];
};

export const getStoreActivePromotions = async ({ limit = 6 } = {}) => {
  const response = await restApi.post('/rpc/listar_promociones_tienda_publicas', {
    p_limit: limit,
  });

  return Array.isArray(response.data) ? response.data : [];
};

export const getStoreCatalog = async ({
  pageNumber = 1,
  pageSize = 12,
  search = '',
  categoriaId = null,
  categoriaIds = [],
  destacado = null,
  tipoCompra = null,
  disponibilidad = null,
  personalizable = null,
  precioMin = null,
  precioMax = null,
  orderBy = 'recientes',
} = {}) => {
  const cleanCategoryIds = Array.isArray(categoriaIds) ? categoriaIds.filter(Boolean) : [];

  const response = await restApi.post('/rpc/listar_catalogo_tienda_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search?.trim() || null,
    p_categoria_id: categoriaId || null,
    p_categoria_ids: cleanCategoryIds.length ? cleanCategoryIds : null,
    p_destacado: destacado,
    p_tipo_compra: tipoCompra || null,
    p_disponibilidad: disponibilidad || null,
    p_es_personalizable: personalizable,
    p_precio_min: precioMin === '' || precioMin === null ? null : Number(precioMin),
    p_precio_max: precioMax === '' || precioMax === null ? null : Number(precioMax),
    p_order_by: orderBy,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const getStoreProductDetail = async (slug) => {
  const response = await restApi.post('/rpc/obtener_producto_tienda_detalle', {
    p_slug: slug,
  });

  const product = Array.isArray(response.data) ? response.data[0] : response.data;

  if (!product?.id) return product;

  const [optionsResult, wholesaleResult, isWholesaleResult] = await Promise.allSettled([
    restApi.post('/rpc/listar_opciones_personalizacion_tienda', {
      p_producto_id: product.id,
    }),
    restApi.post('/rpc/listar_precios_mayoristas_producto', {
      p_producto_id: product.id,
    }),
    restApi.post('/rpc/es_cliente_mayorista_actual', {}),
  ]);

  const optionsData = optionsResult.status === 'fulfilled' && Array.isArray(optionsResult.value.data)
    ? optionsResult.value.data
    : [];

  const wholesaleRows = wholesaleResult.status === 'fulfilled' && Array.isArray(wholesaleResult.value.data)
    ? wholesaleResult.value.data
    : [];

  const isWholesaleCustomer = isWholesaleResult.status === 'fulfilled'
    ? (Array.isArray(isWholesaleResult.value.data)
      ? Boolean(isWholesaleResult.value.data[0])
      : Boolean(isWholesaleResult.value.data))
    : false;

  const wholesaleByVariantId = new Map(
    wholesaleRows.map((row) => [String(row.variante_id), row])
  );

  return {
    ...product,
    es_cliente_mayorista: isWholesaleCustomer,
    variantes: (product.variantes || []).map((variant) => ({
      ...variant,
      precio_mayorista_tramos: wholesaleByVariantId.get(String(variant.id))?.tramos || [],
    })),
    personalizacion_opciones: optionsData,
  };
};

export const requestWholesaleAccount = async (payload = {}) => {
  const data = typeof payload === 'string'
    ? { mensaje: payload }
    : payload || {};

  const response = await restApi.post('/rpc/solicitar_cuenta_mayorista', {
    p_negocio_nombre: data.negocioNombre || null,
    p_ruc: data.ruc || null,
    p_giro_negocio: data.giroNegocio || null,
    p_volumen_estimado: data.volumenEstimado || null,
    p_telefono: data.telefono || null,
    p_mensaje: data.mensaje || null,
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
};
