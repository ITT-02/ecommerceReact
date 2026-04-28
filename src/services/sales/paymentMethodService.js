// Servicio para métodos de pago administrables.
// Esta tabla existe por el patch que ya ejecutaste.

import { restApi } from '../../api/restApi';

export const getPaymentMethods = async () => {
  const response = await restApi.get('/metodos_pago', {
    params: { select: '*', order: 'orden_visual.asc' },
  });
  return response.data;
};

export const createPaymentMethod = async (method) => {
  const response = await restApi.post('/metodos_pago', method, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const updatePaymentMethod = async (id, method) => {
  const response = await restApi.patch('/metodos_pago', method, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
