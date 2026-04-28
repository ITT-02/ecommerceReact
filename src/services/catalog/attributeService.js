// Servicio para atributos de catálogo y sus valores.

import { restApi } from '../../api/restApi';

export const getAttributes = async () => {
  const response = await restApi.get('/atributos_catalogo', {
    params: { select: '*,atributo_valores(*)', order: 'nombre.asc' },
  });
  return response.data;
};

export const createAttribute = async (attribute) => {
  const response = await restApi.post('/atributos_catalogo', attribute, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const getAttributeValues = async (attributeId) => {
  const response = await restApi.get('/atributo_valores', {
    params: { atributo_id: `eq.${attributeId}`, select: '*', order: 'orden_visual.asc' },
  });
  return response.data;
};
