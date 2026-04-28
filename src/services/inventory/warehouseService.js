// Servicio para almacenes.

import { restApi } from '../../api/restApi';

export const getWarehouses = async () => {
  const response = await restApi.get('/almacenes', {
    params: { select: '*', order: 'nombre.asc' },
  });
  return response.data;
};

export const createWarehouse = async (warehouse) => {
  const response = await restApi.post('/almacenes', warehouse, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
