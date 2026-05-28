// Servicio para categorías y subcategorías.

import { restApi } from '../../api/restApi';
import { deleteFile } from '../filesService';

const CATEGORY_BUCKET = 'category-images';

/**
 * Respuesta paginado flexible
 */
const normalizePaginatedCategories = (data, pageNumber, pageSize) => {
  const payload = Array.isArray(data) ? data[0] : data;

  const items = payload?.items ?? [];
  const totalCount = Number(payload?.totalCount ?? payload?.total_count ?? 0);

  const totalPages = Number(
    payload?.totalPages ??
    payload?.total_pages ??
    Math.ceil(totalCount / pageSize) ??
    1
  );

  return {
    items,
    totalCount,
    pageNumber: Number(payload?.pageNumber ?? payload?.page_number ?? pageNumber),
    pageSize: Number(payload?.pageSize ?? payload?.page_size ?? pageSize),
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    hasPreviousPage: Boolean(
      payload?.hasPreviousPage ??
      payload?.has_previous_page ??
      pageNumber > 1
    ),
    hasNextPage: Boolean(
      payload?.hasNextPage ??
      payload?.has_next_page ??
      pageNumber < totalPages
    ),
  };
};

export const getCategories = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActiva = null,
  esVisible = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_categorias_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search?.trim() || null,
    p_es_activa: esActiva,
    p_es_visible: esVisible,
    p_categoria_padre_id: null,
  });

  return normalizePaginatedCategories(response.data, pageNumber, pageSize);
};

export const getSubcategories = async (parentId, search = '') => {
  const response = await restApi.post('/rpc/listar_subcategorias_por_padre', {
    p_categoria_padre_id: parentId,
    p_search: search?.trim() || null,
  });

  return response.data ?? [];
};

export const createCategory = async (category) => {
  const response = await restApi.post('/categorias', category, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const updateCategory = async (id, category) => {
  const response = await restApi.patch('/categorias', category, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const deleteCategory = async (category) => {
  const response = await restApi.delete('/categorias', {
    params: { id: `eq.${category.id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  if (category.imagen_path) {
    await deleteFile({
      bucket: CATEGORY_BUCKET,
      path: category.imagen_path,
    });
  }

  return response.data[0] || null;
};

export const getCategoriesForPromotion = async () => {
  const response = await restApi.get('/categorias', {
    params: {
      select: 'id,nombre',
      es_activa: 'eq.true',
      order: 'nombre.asc',
    },
  });

  return response.data || [];
};