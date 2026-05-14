// Servicio para almacenes.

import { restApi } from '../../api/restApi';

/**
 * Lista almacenes paginados.
 *
 * Devuelve:
 * {
 *   items,
 *   totalCount,
 *   pageNumber,
 *   pageSize,
 *   totalPages,
 *   hasPreviousPage,
 *   hasNextPage
 * }
 */
export const getWarehouses = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  esActivo = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_almacenes_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_es_activo: esActivo,
  });

  return response.data;
};

/**
 * Obtiene un almacén por id.
 * Se usa antes de editar para cargar el formulario
 * con los datos completos del registro.
 */
export const getWarehouseById = async (id) => {
  const response = await restApi.get('/almacenes', {
    params: { id: `eq.${id}`, select: '*' },
  });
  return response.data[0] || null;
};

/**
 * Crea un almacén.
 */
export const createWarehouse = async (warehouse) => {
  const response = await restApi.post('/almacenes', warehouse, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

/**
 * Actualiza un almacén por id.
 */
export const updateWarehouse = async (id, warehouse) => {
  const response = await restApi.patch('/almacenes', warehouse, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

/**
 * Desactiva un almacén.
 * No elimina físicamente el registro.
 */
export const deactivateWarehouse = async (id) => {
  const response = await restApi.patch(
    '/almacenes',
    { es_activo: false },
    {
      params: { id: `eq.${id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    }
  );
  return response.data[0] || null;
};

/**
 * Elimina físicamente un almacén por id.
 */
export const deleteWarehouse = async (id) => {
  const response = await restApi.delete('/almacenes', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};