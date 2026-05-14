// Servicio para métodos de pago administrables.
// Esta tabla existe por el patch que ya ejecutaste.

import { restApi } from '../../api/restApi';
import { uploadFile, replaceFile } from '../filesService';

const PAYMENT_METHODS_BUCKET = 'payment-methods';
const PAYMENT_METHODS_FOLDER = 'imagenes';

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
  let imagen_url = method.imagen_url || null;
  let imagen_path = method.imagen_path || null;

  if (method.imageFile) {
    const uploadedImage = await uploadFile({
      bucket: PAYMENT_METHODS_BUCKET,
      folder: PAYMENT_METHODS_FOLDER,
      file: method.imageFile,
    });

    imagen_url = uploadedImage.url;
    imagen_path = uploadedImage.path;
  }

  const payload = {
    codigo: method.codigo || null,
    nombre: method.nombre || null,
    tipo: method.tipo || null,
    moneda: method.moneda || null,
    titular: method.titular || null,
    numero_cuenta: method.numero_cuenta || null,
    telefono: method.telefono || null,
    instrucciones: method.instrucciones || null,
    orden_visual: method.orden_visual !== undefined ? Number(method.orden_visual) : null,
    imagen_url,
    imagen_path,
    es_activo: Boolean(method.es_activo),
  };

  const response = await restApi.post('/metodos_pago', payload, {
    params: { select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};

export const updatePaymentMethod = async (id, method) => {
  let imagen_url = method.imagen_url || null;
  let imagen_path = method.imagen_path || null;

  if (method.imageFile) {
    const uploadedImage = await replaceFile({
      bucket: PAYMENT_METHODS_BUCKET,
      folder: PAYMENT_METHODS_FOLDER,
      newFile: method.imageFile,
      oldPath: method.imagen_path,
    });

    imagen_url = uploadedImage.url;
    imagen_path = uploadedImage.path;
  }

  const payload = {
    codigo: method.codigo || null,
    nombre: method.nombre || null,
    tipo: method.tipo || null,
    moneda: method.moneda || null,
    titular: method.titular || null,
    numero_cuenta: method.numero_cuenta || null,
    telefono: method.telefono || null,
    instrucciones: method.instrucciones || null,
    orden_visual: method.orden_visual !== undefined ? Number(method.orden_visual) : null,
    imagen_url,
    imagen_path,
    es_activo: Boolean(method.es_activo),
  };

  const response = await restApi.patch('/metodos_pago', payload, {
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
