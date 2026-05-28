// Servicios de cotizaciones del cliente.
// Usa RPC para mantener el frontend desacoplado del modelo físico de Supabase.

import { restApi } from '../../api/restApi';
import { uploadFile } from '../filesService';

const QUOTE_DESIGNS_BUCKET = 'quote-designs';
const QUOTE_DESIGNS_FOLDER = 'cotizaciones';

const normalizePaginated = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? [];
  const totalCount = value?.totalCount ?? items.length;
  const currentPage = value?.pageNumber ?? pageNumber;
  const currentPageSize = value?.pageSize ?? pageSize;
  const totalPages = value?.totalPages ?? Math.max(Math.ceil(totalCount / currentPageSize), 1);

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: value?.hasPreviousPage ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? currentPage < totalPages,
  };
};

export const createQuoteRequest = async ({
  productoId,
  varianteId,
  cantidad = 1,
  nombreCliente = '',
  telefonoCliente = '',
  correoCliente = '',
  mensajeCliente = '',
  notasItem = '',
  tipoSolicitud = 'cotizacion',
  requierePersonalizacion = false,
  detallePersonalizacion = {},
  referenciaDisenoUrl = '',
  referenciaDisenoPath = '',
  referenciaDisenoFile = null,
  personalizaciones = [],
}) => {
  const uploadCustomizationFile = async (file) => {
    if (!file) return null;

    return uploadFile({
      bucket: QUOTE_DESIGNS_BUCKET,
      folder: `${QUOTE_DESIGNS_FOLDER}/${productoId}`,
      file,
    });
  };

  const normalizedPersonalizations = await Promise.all(
    (personalizaciones || []).map(async (item) => {
      const uploaded = item.archivo_file ? await uploadCustomizationFile(item.archivo_file) : null;

      return {
        opcion_id: item.opcion_id || null,
        opcion_codigo: item.opcion_codigo || item.codigo || '',
        opcion_nombre: item.opcion_nombre || item.nombre || '',
        tipo_campo: item.tipo_campo || 'texto',
        valor_texto: item.valor_texto || '',
        valor_json: {
          ...(item.valor_json || {}),
          precio_adicional: Number(item.precio_adicional || 0),
          requiere_cotizacion: Boolean(item.requiere_cotizacion),
        },
        observacion: item.observacion || '',
        archivo_url: uploaded?.url || item.archivo_url || '',
        archivo_path: uploaded?.path || item.archivo_path || '',
        archivo_nombre: uploaded?.name || item.archivo_nombre || uploaded?.path?.split('/').pop() || '',
        precio_adicional: Number(item.precio_adicional || 0),
        requiere_cotizacion: Boolean(item.requiere_cotizacion),
      };
    })
  );

  const uploadedReference = referenciaDisenoFile
    ? await uploadCustomizationFile(referenciaDisenoFile)
    : null;

  const firstFile = normalizedPersonalizations.find((item) => item.archivo_url || item.archivo_path);

  const response = await restApi.post('/rpc/crear_solicitud_cotizacion', {
    p_producto_id: productoId,
    p_variante_id: varianteId,
    p_cantidad: Number(cantidad) || 1,
    p_nombre_cliente: nombreCliente || null,
    p_telefono_cliente: telefonoCliente || null,
    p_correo_cliente: correoCliente || null,
    p_mensaje_cliente: mensajeCliente || null,
    p_notas_item: notasItem || null,
    p_tipo_solicitud: tipoSolicitud || 'cotizacion',
    p_requiere_personalizacion: Boolean(requierePersonalizacion),
    p_detalle_personalizacion: detallePersonalizacion || {},
    p_referencia_diseno_url: uploadedReference?.url || firstFile?.archivo_url || referenciaDisenoUrl || null,
    p_referencia_diseno_path: uploadedReference?.path || firstFile?.archivo_path || referenciaDisenoPath || null,
    p_personalizaciones: normalizedPersonalizations,
  });

  return response.data;
};

export const getMyQuotesPaginated = async ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  search = '',
} = {}) => {
  const response = await restApi.post('/rpc/listar_mis_cotizaciones_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_estado: estado || null,
    p_search: search || null,
  });

  return normalizePaginated(response.data, pageNumber, pageSize);
};

export const getMyQuoteDetail = async (id) => {
  const response = await restApi.post('/rpc/obtener_mi_cotizacion_detalle', {
    p_cotizacion_id: id,
  });

  return response.data || null;
};

export const markMyQuoteAsRead = async (id) => {
  const response = await restApi.post('/rpc/marcar_mi_cotizacion_como_vista', {
    p_cotizacion_id: id,
  });

  return response.data;
};

export const acceptMyQuote = async ({ cotizacionId, direccionId = null }) => {
  const response = await restApi.post('/rpc/aceptar_mi_cotizacion', {
    p_cotizacion_id: cotizacionId,
    p_direccion_id: direccionId || null,
  });

  return response.data;
};

export const cancelMyQuote = async ({ cotizacionId, comentario = '' }) => {
  const response = await restApi.post('/rpc/cancelar_mi_cotizacion', {
    p_cotizacion_id: cotizacionId,
    p_comentario: comentario || null,
  });

  return response.data;
};
