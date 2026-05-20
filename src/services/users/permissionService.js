// Servicio para permisos.
import { restApi } from '../../api/restApi';

/**
 * Lista permisos administrativos.
 */
export const getAdminPermissions = async ({ search = '', modulo = null } = {}) => {
  const response = await restApi.post('/rpc/listar_permisos_admin', {
    p_search: search || null,
    p_modulo: modulo || null,
  });

  return response.data || [];
};

/**
 * Obtiene el detalle de un permiso.
 */
export const getAdminPermissionDetail = async (permissionId) => {
  const response = await restApi.post('/rpc/obtener_permiso_admin_detalle', {
    p_permiso_id: permissionId,
  });

  return response.data || null;
};
