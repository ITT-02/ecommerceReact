// Servicios para mensajes enviados desde el formulario público de contacto.

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

export const createContactMessage = async ({
  nombre,
  email,
  whatsapp,
  motivo,
  mensaje,
  origen = 'formulario_contacto',
}) => {
  const response = await restApi.post('/rpc/crear_mensaje_contacto', {
    p_nombre: nombre,
    p_email: email,
    p_whatsapp: whatsapp || null,
    p_motivo: motivo,
    p_mensaje: mensaje,
    p_origen: origen,
  });

  return response.data;
};

export const getAdminContactMessages = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
  motivo = null,
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_mensajes_contacto_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado: estado || null,
    p_motivo: motivo || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const markContactMessageRead = async (id) => {
  const response = await restApi.post('/rpc/marcar_mensaje_contacto_leido', {
    p_mensaje_id: id,
  });

  return response.data;
};

export const deleteContactMessage = async (id) => {
  const response = await restApi.post('/rpc/eliminar_mensaje_contacto_admin', {
    p_mensaje_id: id,
  });

  return response.data;
};
