// Servicio genérico para módulos administrativos simples.
// Mantiene el consumo por REST para tablas auxiliares creadas por el parche SQL.

import { restApi } from '../../api/restApi';

export const normalizePaginated = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? value?.data ?? value?.registros ?? (Array.isArray(value) ? value : []);
  const totalCount = value?.totalCount ?? value?.total_count ?? value?.total ?? items.length;
  const currentPage = value?.pageNumber ?? value?.page_number ?? pageNumber;
  const currentPageSize = value?.pageSize ?? value?.page_size ?? pageSize;
  const totalPages = value?.totalPages ?? value?.total_pages ?? Math.max(Math.ceil(totalCount / Math.max(currentPageSize, 1)), 1);

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

export const listResource = async ({
  table,
  select = '*',
  pageNumber = 1,
  pageSize = 10,
  search = '',
  searchColumns = [],
  filters = {},
  order = 'created_at.desc',
}) => {
  const params = {
    select,
    order,
    limit: pageSize,
    offset: (pageNumber - 1) * pageSize,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params[key] = value;
    }
  });

  if (search?.trim() && searchColumns.length) {
    const term = search.trim();
    params.or = `(${searchColumns.map((column) => `${column}.ilike.*${term}*`).join(',')})`;
  }

  const response = await restApi.get(`/${table}`, {
    params,
    headers: { Prefer: 'count=exact' },
  });

  const totalCount = Number(response.headers?.['content-range']?.split('/')?.[1] || response.data?.length || 0);

  return normalizePaginated({ items: response.data ?? [], totalCount, pageNumber, pageSize }, pageNumber, pageSize);
};

export const upsertResource = async ({ table, data, idField = 'id' }) => {
  if (data?.[idField]) {
    const response = await restApi.patch(`/${table}`, data, {
      params: { [idField]: `eq.${data[idField]}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    });
    return response.data?.[0] || null;
  }

  const response = await restApi.post(`/${table}`, data, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data?.[0] || null;
};

export const patchResource = async ({ table, id, data, idField = 'id' }) => {
  const response = await restApi.patch(`/${table}`, data, {
    params: { [idField]: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data?.[0] || null;
};
