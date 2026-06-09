import { restApi } from '../../api/restApi';
import { uploadFiles } from '../filesService';

const PRODUCT_MEDIA_BUCKET = 'product-media';
const PARTNER_MEDIA_FOLDER = 'socios-productos';

const normalizePaginatedResponse = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? [];
  const totalCount = Number(value?.totalCount ?? items.length);
  const currentPage = Number(value?.pageNumber ?? pageNumber);
  const currentPageSize = Number(value?.pageSize ?? pageSize);
  const totalPages = Number(
    value?.totalPages ?? Math.max(Math.ceil(totalCount / Math.max(currentPageSize, 1)), 1)
  );

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  };
};

const mapUploadedMedia = (uploadedFiles = [], productName = '') =>
  uploadedFiles.map((file, index) => ({
    tipo_multimedia: file.type?.startsWith('video/') ? 'video' : 'imagen',
    url_archivo: file.url,
    path_archivo: file.path,
    texto_alternativo: productName || file.name,
    orden_visual: index + 1,
    es_portada: index === 0 && !file.type?.startsWith('video/'),
  }));

export const getPartnerCategoryOptions = async () => {
  const response = await restApi.get('/categorias', {
    params: {
      select: 'id,nombre',
      es_activa: 'eq.true',
      es_visible: 'eq.true',
      order: 'nombre.asc',
    },
  });

  return response.data || [];
};

export const getPartnerAttributeOptions = async () => {
  const response = await restApi.post('/rpc/obtener_atributos_para_variantes', {});
  return response.data || [];
};

export const getMyPartnerProductsForVariants = async ({ search = '' } = {}) => {
  const response = await restApi.post('/rpc/listar_mis_productos_socio_para_variantes', {
    p_search: search || null,
  });

  return response.data || [];
};

export const listPartnerProductRequests = async ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  scope = 'mine',
  search = '',
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_solicitudes_productos_socio', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_estado: estado || null,
    p_scope: scope,
    p_search: search || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizePaginatedResponse(response.data, pageNumber, pageSize);
};

export const createPartnerProductRequest = async ({
  product,
  variant,
  attributes = [],
  mediaFiles = [],
  comment = '',
  sendForReview = true,
  existingProductId = null,
}) => {
  const uploadedFiles = mediaFiles.length
    ? await uploadFiles({
        bucket: PRODUCT_MEDIA_BUCKET,
        folder: PARTNER_MEDIA_FOLDER,
        files: mediaFiles,
      })
    : [];

  const response = await restApi.post('/rpc/crear_solicitud_producto_socio', {
    p_producto: product,
    p_variante: variant,
    p_atributos: attributes,
    p_multimedia: mapUploadedMedia(uploadedFiles, product?.nombre),
    p_comentario_socio: comment || null,
    p_enviar_revision: sendForReview,
    p_producto_existente_id: existingProductId || null,
  });

  return response.data;
};

export const reviewPartnerProductRequest = async ({
  requestId,
  action,
  comment = '',
  commissionPercent = 0,
  stockMode = 'sin_ingreso',
  warehouseId = null,
  stockQuantity = 0,
}) => {
  const response = await restApi.post('/rpc/revisar_solicitud_producto_socio', {
    p_solicitud_id: requestId,
    p_accion: action,
    p_comentario_revision: comment || null,
    p_socio_comision_porcentaje: Number(commissionPercent) || 0,
    p_stock_modo: stockMode || 'sin_ingreso',
    p_almacen_ingreso_id: warehouseId || null,
    p_cantidad_ingreso: Number(stockQuantity) || 0,
    p_costo_unitario_ingreso: null,
  });

  return response.data;
};

export const getCommercialPartnerReport = async ({ fechaInicio = null, fechaFin = null } = {}) => {
  const response = await restApi.post('/rpc/obtener_reporte_socio_comercial', {
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const requestCommercialPartnerAccount = async ({
  negocioNombre = '',
  ruc = '',
  telefono = '',
  mensaje = '',
} = {}) => {
  const response = await restApi.post('/rpc/solicitar_socio_comercial', {
    p_negocio_nombre: negocioNombre || null,
    p_ruc: ruc || null,
    p_telefono: telefono || null,
    p_mensaje: mensaje || null,
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const listCommercialPartnerAccountRequests = async ({
  pageNumber = 1,
  pageSize = 10,
  estado = null,
  search = '',
  fechaInicio = null,
  fechaFin = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_solicitudes_socios_comerciales', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_estado: estado || null,
    p_search: search || null,
    p_fecha_inicio: fechaInicio || null,
    p_fecha_fin: fechaFin || null,
  });

  return normalizePaginatedResponse(response.data, pageNumber, pageSize);
};

export const reviewCommercialPartnerAccountRequest = async ({ requestId, action, comment = '' }) => {
  const response = await restApi.post('/rpc/revisar_solicitud_socio_comercial', {
    p_solicitud_id: requestId,
    p_accion: action,
    p_comentario_revision: comment || null,
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
};


export const updatePartnerProductCommercialConditions = async ({
  productId,
  commissionPercent = 0,
  isActive = null,
} = {}) => {
  const response = await restApi.post('/rpc/actualizar_condiciones_producto_socio_admin', {
    p_producto_id: productId,
    p_socio_comision_porcentaje: Number(commissionPercent) || 0,
    p_es_activo: typeof isActive === 'boolean' ? isActive : null,
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
};
