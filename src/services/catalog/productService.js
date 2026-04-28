// Servicio CRUD de productos base.
// Precio, stock e imágenes se gestionan en variantes, inventario y multimedia.

import { restApi } from '../../api/restApi';

export const getProducts = async () => {
  const response = await restApi.get('/productos', {
    params: {
      select: '*,categorias(id,nombre,slug)',
      order: 'created_at.desc',
    },
  });

  return response.data;
};

export const getProductById = async (id) => {
  const response = await restApi.get('/productos', {
    params: {
      id: `eq.${id}`,
      select: '*,categorias(id,nombre,slug),producto_variantes(*)',
    },
  });

  return response.data[0] || null;
};

export const createProduct = async (product) => {
  const response = await restApi.post('/productos', product, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const updateProduct = async (id, product) => {
  const response = await restApi.patch('/productos', product, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const deleteProduct = async (id) => {
  const response = await restApi.delete('/productos', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};
