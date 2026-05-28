// Servicios para administrar opciones de personalización.
// Mantiene el frontend desacoplado del modelo físico de Supabase usando RPC.

import { restApi } from '../../api/restApi';

export const CUSTOMIZATION_FIELD_TYPES = [
  { value: 'texto', label: 'Texto corto' },
  { value: 'textarea', label: 'Texto largo' },
  { value: 'archivo', label: 'Archivo' },
  { value: 'select', label: 'Lista de opciones' },
  { value: 'color', label: 'Color' },
  { value: 'numero', label: 'Número' },
  { value: 'boolean', label: 'Sí / No' },
];

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

export const getCustomizationOptions = async ({ onlyActive = false } = {}) => {
  const response = await restApi.post('/rpc/listar_opciones_personalizacion_admin', {
    p_solo_activas: Boolean(onlyActive),
  });

  return normalizeArray(response.data);
};

export const saveCustomizationOption = async (option) => {
  const response = await restApi.post('/rpc/guardar_opcion_personalizacion_admin', {
    p_opcion_id: option.id || null,
    p_codigo: option.codigo,
    p_nombre: option.nombre,
    p_descripcion: option.descripcion || null,
    p_tipo_campo: option.tipo_campo || 'texto',
    p_acepta_archivo: Boolean(option.acepta_archivo),
    p_opciones_json: option.opciones_json || [],
    p_orden_visual: Number(option.orden_visual || 0),
    p_es_activo: option.es_activo ?? true,
  });

  return response.data;
};

export const deactivateCustomizationOption = async (option) => {
  const response = await restApi.post('/rpc/desactivar_opcion_personalizacion_admin', {
    p_opcion_id: option.id,
  });

  return response.data;
};

export const getProductCustomizationOptions = async (productId) => {
  if (!productId) return [];

  const response = await restApi.post('/rpc/listar_opciones_personalizacion_producto', {
    p_producto_id: productId,
  });

  return normalizeArray(response.data);
};

export const saveProductCustomizationOptions = async ({ productId, options = [] }) => {
  if (!productId) return null;

  const response = await restApi.post('/rpc/guardar_opciones_personalizacion_producto', {
    p_producto_id: productId,
    p_opciones: options,
  });

  return response.data;
};
