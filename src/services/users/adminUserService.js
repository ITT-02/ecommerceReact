import { restApi } from '../../api/restApi';

export const getAdminUsers = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  estado = null,
  rolCodigo = null,
}) => {
  const response = await restApi.post('/rpc/listar_usuarios_admin_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search || null,
    p_estado: estado,
    p_rol_codigo: rolCodigo,
  });
  return response.data;
};

export const getAdminUserDetail = async (usuarioId) => {
  const response = await restApi.post('/rpc/obtener_usuario_admin_detalle', {
    p_usuario_id: usuarioId,
  });
  return response.data;
};

export const updateUserProfile = async ({
  usuarioId,
  nombres,
  apellidos,
  telefono,
  tipoDocumento,
  documentoIdentidad,
  estado,
}) => {
  const response = await restApi.post('/rpc/actualizar_perfil_usuario_admin', {
    p_usuario_id: usuarioId,
    p_nombres: nombres,
    p_apellidos: apellidos,
    p_telefono: telefono || null,
    p_tipo_documento: tipoDocumento || 'DNI',
    p_documento_identidad: documentoIdentidad || null,
    p_estado: estado,
  });
  return response.data;
};

export const assignUserRoles = async ({ usuarioId, roles }) => {
  const response = await restApi.post('/rpc/asignar_roles_usuario_admin', {
    p_usuario_id: usuarioId,
    p_roles: roles,
  });
  return response.data;
};

export const getRoleOptions = async () => {
  const response = await restApi.post('/rpc/listar_roles_admin_opciones', {});
  return response.data;
};
