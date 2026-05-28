// Servicios administrativos de finanzas y rentabilidad.

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

export const getFinanceSummary = async ({ fechaInicio = null, fechaFin = null } = {}) => {
  const response = await restApi.post('/rpc/obtener_resumen_financiero_admin', {
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });
  return response.data || {};
};

export const getProfitOrders = async ({ pageNumber = 1, pageSize = 10, search = '', fechaInicio = null, fechaFin = null } = {}) => {
  const response = await restApi.post('/rpc/listar_ganancias_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });
  return normalizePaginated(response.data, pageNumber, pageSize);
};
