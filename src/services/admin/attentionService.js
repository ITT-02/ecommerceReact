// Contadores compactos para mostrar pendientes en el menú administrativo.

import { restApi } from '../../api/restApi';

export const getAdminAttentionCounters = async () => {
  const response = await restApi.post('/rpc/obtener_contadores_atencion_admin', {});
  return response.data || {};
};
