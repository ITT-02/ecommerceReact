// Servicios de venta manual asistida.

import { restApi } from '../../api/restApi';
import { uploadFile } from '../filesService';

const QUOTE_DESIGNS_BUCKET = 'quote-designs';
const QUOTE_DESIGNS_FOLDER = 'venta-manual';
const PAYMENT_PROOFS_BUCKET = 'payment-proofs';
const PAYMENT_PROOFS_FOLDER = 'venta-manual';

const normalizePaginated = (data) => {
  const value = Array.isArray(data) ? data[0] : data;
  return value?.items ?? [];
};

const uploadPersonalizationFile = async ({ productoId, file }) => {
  if (!file) return null;

  return uploadFile({
    bucket: QUOTE_DESIGNS_BUCKET,
    folder: `${QUOTE_DESIGNS_FOLDER}/${productoId}`,
    file,
  });
};

const uploadPaymentProof = async (file) => {
  if (!file) return null;

  return uploadFile({
    bucket: PAYMENT_PROOFS_BUCKET,
    folder: `${PAYMENT_PROOFS_FOLDER}/${Date.now()}`,
    file,
  });
};

const normalizePersonalizations = async (item) => {
  const selected = (item.personalizaciones || []).filter((custom) => custom.seleccionado);

  return Promise.all(
    selected.map(async (custom) => {
      const uploaded = await uploadPersonalizationFile({
        productoId: item.producto_id,
        file: custom.archivo_file,
      });

      return {
        opcion_id: custom.opcion_id || custom.id || null,
        opcion_codigo: custom.opcion_codigo || custom.codigo || '',
        opcion_nombre: custom.opcion_nombre || custom.nombre || '',
        tipo_campo: custom.tipo_campo || 'texto',
        valor_texto: custom.valor_texto || '',
        observacion: custom.observacion || '',
        archivo_url: uploaded?.url || custom.archivo_url || '',
        archivo_path: uploaded?.path || custom.archivo_path || '',
        archivo_nombre: uploaded?.name || custom.archivo_nombre || '',
        precio_adicional: Number(custom.precio_adicional || 0),
        valor_json: {
          ...(custom.valor_json || {}),
          precio_adicional: Number(custom.precio_adicional || 0),
        },
      };
    })
  );
};

const normalizeItems = async (items = []) => {
  return Promise.all(
    items.map(async (item) => ({
      variante_id: item.variante_id,
      producto_id: item.producto_id,
      cantidad: Number(item.cantidad || 1),
      tipo_item: item.tipo_item || 'estandar',
      es_personalizado: item.tipo_item === 'personalizado',
      precio_base_unitario: Number(item.precio_base_unitario || 0),
      precio_personalizacion_unitario: Number(item.precio_personalizacion_unitario || 0),
      costo_unico_personalizacion: Number(item.costo_unico_personalizacion || 0),
      descuento_linea: Number(item.descuento_linea || 0),
      precio_unitario: Number(item.precio_unitario || 0),
      total_linea: Number(item.total_linea || 0),
      costo_unitario: Number(item.costo_unitario || 0),
      precio_lista: Number(item.precio_lista || 0),
      motivo_precio_manual: item.motivo_precio_manual || '',
      observacion_produccion: item.observacion_produccion || '',
      requiere_abastecimiento: Boolean(item.requiere_abastecimiento),
      personalizaciones: await normalizePersonalizations(item),
    }))
  );
};

export const searchManualSaleProducts = async ({
  search = '',
  categoriaId = null,
  pageNumber = 1,
  pageSize = 12,
} = {}) => {
  const response = await restApi.post('/rpc/listar_productos_venta_manual', {
    p_search: search,
    p_categoria_id: categoriaId,
    p_page_number: pageNumber,
    p_page_size: pageSize,
  });

  return normalizePaginated(response.data);
};

export const createManualSale = async ({ cliente, entrega, items, pago, notasInternas }) => {
  const normalizedItems = await normalizeItems(items);
  const uploadedProof = await uploadPaymentProof(pago?.comprobanteFile);

  const response = await restApi.post('/rpc/crear_venta_manual_admin_v2', {
    p_cliente: cliente || {},
    p_entrega: entrega || {},
    p_items: normalizedItems,
    p_pago: {
      metodo_pago: pago?.metodoPago || null,
      estado_pago: pago?.estadoPago || 'pendiente',
      referencia_transaccion: pago?.referenciaTransaccion || null,
      url_comprobante: uploadedProof?.url || null,
      comprobante_path: uploadedProof?.path || null,
    },
    p_notas_internas: notasInternas || null,
  });

  return response.data;
};

export const createManualQuote = async ({ cliente, entrega, items, notasInternas }) => {
  const normalizedItems = await normalizeItems(items);

  const response = await restApi.post('/rpc/crear_cotizacion_manual_admin', {
    p_cliente: cliente || {},
    p_entrega: entrega || {},
    p_items: normalizedItems,
    p_notas_internas: notasInternas || null,
  });

  return response.data;
};
