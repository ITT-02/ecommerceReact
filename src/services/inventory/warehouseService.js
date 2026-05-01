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

export const getWarehouseById = async (id) => {
  const response = await restApi.get('/almacenes', {
    params: { id: `eq.${id}`, select: '*' },
  });
  return response.data[0] || null;
};

export const updateWarehouse = async (id, warehouse) => {
  console.log('🔄 Llamando updateWarehouse con id:', id, 'y data:', warehouse);
  const response = await restApi.patch('/almacenes', warehouse, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  console.log('✅ Respuesta de updateWarehouse:', response.data);
  return response.data[0] || null;
};

export const deactivateWarehouse = async (id) => {
  const response = await restApi.patch('/almacenes', { es_activo: false }, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const deleteWarehouse = async (id) => {
  const response = await restApi.delete('/almacenes', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
