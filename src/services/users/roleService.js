// Servicio para roles.

import { restApi } from '../../api/restApi';

export const getRoles = async () => {
  const response = await restApi.get('/roles', {
    params: { select: '*', order: 'nombre.asc' },
  });
  return response.data;
};
