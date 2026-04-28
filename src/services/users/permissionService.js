// Servicio para permisos.

import { restApi } from '../../api/restApi';

export const getPermissions = async () => {
  const response = await restApi.get('/permisos', {
    params: { select: '*', order: 'codigo.asc' },
  });
  return response.data;
};
