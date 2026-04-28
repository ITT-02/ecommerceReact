// Servicio para usuarios y perfiles.

import { restApi } from '../../api/restApi';

export const getUsers = async () => {
  const response = await restApi.get('/perfiles', {
    params: { select: '*,usuarios_roles(*,roles(*))', order: 'created_at.desc' },
  });
  return response.data;
};
