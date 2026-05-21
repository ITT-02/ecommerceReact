// Servicio para roles.

import { restApi } from '../../api/restApi';

export const getRoles = async (search = '') => {
  const response = await restApi.post('/rpc/listar_roles_admin', {
    p_search: search || null,
  });
  return response.data || [];
};

export const getRoleDetail = async(id) => {
  const response = await restApi.post('/rpc/obtener_rol_admin_detalle',{
    p_rol_id:id,
  });
  return response.data;
}

export const getPermissionOptions = async () => {
  const response = await restApi.post('/rpc/listar_permisos_admin_opciones', {});
  return response.data || [];
};

export const updateRole = async (form) => {
  const response = await restApi.post('/rpc/actualizar_rol_admin', {
    p_rol_id: form.id,
    p_nombre: form.nombre,
    p_descripcion: form.descripcion || null,
  });
  return response.data;
};

export const assignRolePermissions = async (form) => {
  const response = await restApi.post('/rpc/asignar_permisos_rol_admin', {
    p_rol_id: form.id,
    p_permisos: form.permisos.map((p) => p.codigo),
  });
  return response.data;
};