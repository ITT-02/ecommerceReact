// Servicios de tienda: catálogo, detalle de producto y filtros.
// Usa RPC para mantener el frontend desacoplado del modelo físico de Supabase.

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

export const getStoreCategories = async () => {
  const response = await restApi.post('/rpc/listar_categorias_tienda', {});
  return Array.isArray(response.data) ? response.data : [];
};

export const getStoreCatalogFilters = async () => {
  const response = await restApi.post('/rpc/listar_filtros_catalogo_tienda', {});
  return response.data || {};
};

export const getStoreCatalog = async ({
  pageNumber = 1,
  pageSize = 12,
  search = '',
  categoriaId = null,
  destacado = null,
  tipoCompra = null,
  orderBy = 'recientes',
} = {}) => {
  const response = await restApi.post('/rpc/listar_catalogo_tienda_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_categoria_id: categoriaId,
    p_destacado: destacado,
    p_tipo_compra: tipoCompra,
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

  const optionsResponse = await restApi.post('/rpc/listar_opciones_personalizacion_tienda', {
    p_producto_id: product.id,
  });

  return {
    ...product,
    personalizacion_opciones: Array.isArray(optionsResponse.data) ? optionsResponse.data : [],
  };
};
