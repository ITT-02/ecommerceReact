// Servicio para categorías y subcategorías.

import { restApi } from '../../api/restApi';
import { deleteFile } from '../filesService';

const CATEGORY_BUCKET = 'category-images';

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

{/*
export const getSubcategories = async (parentId) => {
  const response = await restApi.get('/categorias', {
    params: {
      select: '*',
      categoria_padre_id: `eq.${parentId}`,
      order: 'orden_visual.asc',
    },
  });

  return response.data;
};

*/}
export const getSubcategories = async (parentId) => {
  const response = await restApi.post('/rpc/listar_subcategorias_por_padre', {
    p_categoria_padre_id: parentId,
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

export const deleteCategory = async (category) => {
  const response = await restApi.delete('/categorias', {
    params: { id: `eq.${category.id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

   if (category.imagen_path) {
    await deleteFile({
      bucket: CATEGORY_BUCKET,
      path: category.imagen_path,
    });
  }

  return response.data[0] || null;
};
