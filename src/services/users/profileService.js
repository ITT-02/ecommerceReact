// Servicio del perfil autenticado.
// Usa la función RPC obtener_mi_contexto_usuario para traer perfil, roles y permisos.

import { restApi } from '../../api/restApi';

export const getMyUserContext = async () => {
  const response = await restApi.post('/rpc/obtener_mi_contexto_usuario', {});
  return response.data;
};

export const updateMyProfile = async (id, profileData) => {
  const response = await restApi.patch('/perfiles', profileData, {
    params: {
      id: `eq.${id}`,
      select: '*',
    },
    headers: {
      Prefer: 'return=representation',
    },
  });

  return response.data[0] || null;
};
