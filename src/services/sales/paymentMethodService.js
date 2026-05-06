// Servicio para métodos de pago administrables.
// Esta tabla existe por el patch que ya ejecutaste.

import { restApi } from '../../api/restApi';

export const getPaymentMethods = async (onlyActive = false) => {
  const params = { select: '*', order: 'orden_visual.asc' };
  if (onlyActive) {
    params.es_activo = 'eq.true';
  }
  const response = await restApi.get('/metodos_pago', { params });
  return response.data;
};

export const getPaymentMethodById = async (id) => {
  const response = await restApi.get('/metodos_pago', {
    params: { id: `eq.${id}`, select: '*' },
  });
  return response.data[0] || null;
};

export const getPaymentMethodByCode = async (codigo) => {
  const response = await restApi.get('/metodos_pago', {
    params: { codigo: `eq.${codigo}`, select: '*' },
  });
  return response.data[0] || null;
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

export const deletePaymentMethod = async (id) => {
  const response = await restApi.delete('/metodos_pago', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
