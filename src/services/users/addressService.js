// Servicio para direcciones del cliente.

import { restApi } from '../../api/restApi';

export const getMyAddresses = async () => {
  const response = await restApi.get('/direcciones_usuario', {
    params: { select: '*', order: 'created_at.desc' },
  });
  return response.data;
};

export const createAddress = async (address) => {
  const response = await restApi.post('/direcciones_usuario', address, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
