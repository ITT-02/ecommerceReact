// Servicio CRUD de variantes de producto.
import { restApi } from '../../api/restApi';


export const getProductsWithVariantsGrouped = async ({
  page = 1,
  limit = 10,
  search = '',
  categoryId = null,
  isActive = null,
  hasVariants = null,
} = {}) => {
  const payload = {
    p_page_number: page,
    p_page_size: limit,
    p_search: search || null,
    p_categoria_id: categoryId || null,
    p_es_activa: isActive,
    p_tiene_variantes: hasVariants,
  };

  const response = await restApi.post('/rpc/listar_productos_con_variantes_admin_paginado', payload);
  return response.data;
};

export const getVariants = async ({ page = 1, limit = 10, search = '', productId = null, isActive = null } = {}) => {
  const payload = {
    p_page_number: page,
    p_page_size: limit,
    p_search: search || null,
    p_producto_id: productId || null,
    p_es_activa: isActive,
  };

  const response = await restApi.post('/rpc/listar_variantes_con_atributos_paginado', payload);
  return response.data;
};

export const getVariantById = async (id) => {
  const response = await restApi.post('/rpc/obtener_variante_con_atributos', {
    p_variante_id: id,
  });
  // Si el RPC devuelve un array de 1, extraemos el primero
  return response.data?.[0] || response.data || null;
};

export const getVariantAttributeOptions = async () => {
  const response = await restApi.post('/rpc/obtener_atributos_para_variantes');
  return response.data;
};

export const createVariant = async ({ variant, attributes = [] }) => {
  const payload = {
    p_variante: variant,
    p_atributos: attributes,
  };

  const response = await restApi.post('/rpc/crear_variante_con_atributos', payload);
  return response.data;
};

export const updateVariant = async (id, { variant, attributes = [] }) => {
  const payload = {
    p_variante_id: id,
    p_variante: variant,
    p_atributos: attributes,
  };

  const response = await restApi.post('/rpc/actualizar_variante_con_atributos', payload);
  return response.data;
};

export const deactivateVariant = async (id) => {
  const response = await restApi.patch('/producto_variantes', { es_activa: false }, {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};
export const deleteVariant = async (id) => {
  const response = await restApi.delete('/producto_variantes', {
    params: { id: `eq.${id}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });
  return response.data[0] || null;
};

export const getProductOptions = async (search = '') => {
  const params = {
    select: 'id,nombre,slug,es_activo',
    es_activo: 'eq.true',
    order: 'nombre.asc',
  };

  if (search?.trim()) {
    params.nombre = `ilike.*${search.trim()}*`;
  }

  const response = await restApi.get('/productos', { params });

  return response.data.map((product) => ({
    id: product.id,
    value: product.id,
    label: product.nombre,
    nombre: product.nombre,
    slug: product.slug,
  }));
};

export const getVariantsForPromotion = async () => {
  const response = await restApi.post('/rpc/listar_variantes_con_atributos_paginado', {
    p_page_number: 1,
    p_page_size: 1000, // Límite alto para obtener todas
    p_search: null,
    p_producto_id: null,
    p_es_activa: null,
  });

  const items = response.data?.items || response.data?.variantes || [];
  return items;
};