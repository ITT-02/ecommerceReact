// Servicio para categorías y subcategorías.

import { restApi } from '../../api/restApi';

export const getCategories = async () => {
  const response = await restApi.get('/categorias', {
    params: {
      select: '*',
      categoria_padre_id: 'is.null',
      order: 'orden_visual.asc',
    },
  });

  return response.data;
};

export const createCategory = async (category) => {
  const response = await restApi.post('/categorias', category, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const updateCategory = async (id, category) => {
  const response = await restApi.patch('/categorias', category, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const deleteCategory = async (id) => {
  const response = await restApi.delete('/categorias', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};
