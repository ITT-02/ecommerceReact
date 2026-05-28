// Adapta datos entre el formulario de producto y el servicio.
// Mantiene el formulario desacoplado del modelo físico de Supabase.

export const initialProductFormData = {
  categoria_id: '',
  nombre: '',
  descripcion_corta: '',
  descripcion_larga: '',
  mostrar_precio: true,
  vender_sin_stock: false,
  destacado: false,
  es_personalizable: false,
  requiere_cotizacion: false,
  es_activo: true,

  // Multimedia nueva al crear producto.
  mediaFiles: [],

  // En edición mezcla archivos locales nuevos y multimedia ya guardada.
  newMediaFiles: [],

  // Multimedia eliminada desde el formulario.
  removedMediaIds: [],
  removedMedia: [],

  // Variantes del producto. Se usan para asociar imagen/video a una variante.
  variantes: [],

  // Reglas de personalización permitidas para este producto.
  personalizacion_opciones: [],
};

export const isLocalFile = (file) => file instanceof File;

export const getLocalFiles = (files = []) => {
  const fileList = Array.isArray(files) ? files : [files];
  return fileList.filter(isLocalFile);
};

const normalizeUuidOrNull = (value) => value || null;

const mapExistingMediaToUpdatePayload = (media = []) =>
  media
    .filter((item) => item?.id && !isLocalFile(item))
    .map((item, index) => ({
      id: item.id,
      producto_id: item.producto_id || null,
      variante_id: normalizeUuidOrNull(item.variante_id),
      tipo_multimedia: item.tipo_multimedia || (item.type?.startsWith?.('video/') ? 'video' : 'imagen'),
      url_archivo: item.url_archivo || item.url || item.src,
      path_archivo: item.path_archivo || null,
      texto_alternativo: item.texto_alternativo?.trim?.() || null,
      orden_visual: Number(item.orden_visual ?? index + 1),
      es_portada: Boolean(item.es_portada),
      es_publica: item.es_publica ?? true,
    }));

export const productToFormData = (product = {}) => ({
  categoria_id: product.categoria_id || '',
  nombre: product.nombre || '',
  descripcion_corta: product.descripcion_corta || '',
  descripcion_larga: product.descripcion_larga || '',
  mostrar_precio: product.mostrar_precio ?? true,
  vender_sin_stock: product.vender_sin_stock ?? false,
  destacado: Boolean(product.destacado),
  es_personalizable: Boolean(product.es_personalizable),
  requiere_cotizacion: Boolean(product.requiere_cotizacion),
  es_activo: product.es_activo ?? true,
  mediaFiles: [],
  newMediaFiles: product.producto_multimedia || product.multimedia || [],
  removedMediaIds: [],
  removedMedia: [],
  variantes: product.variantes || [],
  personalizacion_opciones: product.personalizacion_opciones || [],
});

export const formDataToProductPayload = (formData) => ({
  categoria_id: formData.categoria_id || null,
  nombre: formData.nombre.trim(),
  descripcion_corta: formData.descripcion_corta.trim() || null,
  descripcion_larga: formData.descripcion_larga.trim() || null,
  mostrar_precio: Boolean(formData.mostrar_precio),
  vender_sin_stock: Boolean(formData.vender_sin_stock),
  destacado: Boolean(formData.destacado),
  es_personalizable: Boolean(formData.es_personalizable),
  requiere_cotizacion: Boolean(formData.requiere_cotizacion),
  es_activo: Boolean(formData.es_activo),
  mediaFiles: formData.mediaFiles || [],
  newMediaFiles: formData.newMediaFiles || [],
  removedMediaIds: formData.removedMediaIds || [],
  removedMedia: formData.removedMedia || [],

  // Se envía al RPC para editar metadata de multimedia ya guardada:
  // texto alternativo, portada, visibilidad, orden y asociación a variante.
  updatedMedia: mapExistingMediaToUpdatePayload(formData.newMediaFiles || []),
  personalizacion_opciones: formData.personalizacion_opciones || [],
});

export const normalizeProductPaginatedResponse = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? value?.data ?? value?.registros ?? [];
  const totalCount = value?.totalCount ?? value?.total_count ?? value?.total ?? items.length;
  const currentPage = value?.pageNumber ?? value?.page_number ?? value?.pagina_actual ?? pageNumber;
  const currentPageSize = value?.pageSize ?? value?.page_size ?? value?.tamano_pagina ?? pageSize;
  const totalPages = value?.totalPages ?? value?.total_pages ?? Math.max(Math.ceil(totalCount / currentPageSize), 1);

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: value?.hasPreviousPage ?? value?.has_previous_page ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? value?.has_next_page ?? currentPage < totalPages,
  };
};

export const mapProductToRpcPayload = (product) => ({
  categoria_id: product.categoria_id || null,
  nombre: product.nombre,
  descripcion_corta: product.descripcion_corta || null,
  descripcion_larga: product.descripcion_larga || null,
  mostrar_precio: Boolean(product.mostrar_precio),
  vender_sin_stock: Boolean(product.vender_sin_stock),
  destacado: Boolean(product.destacado),
  es_personalizable: Boolean(product.es_personalizable),
  requiere_cotizacion: Boolean(product.requiere_cotizacion),
  es_activo: Boolean(product.es_activo),
});

export const mapUploadedFilesToProductMultimedia = (
  uploadedFiles,
  productName,
  hasCurrentCover = false
) =>
  uploadedFiles.map((file, index) => ({
    variante_id: null,
    tipo_multimedia: file.type?.startsWith('video/') ? 'video' : 'imagen',
    url_archivo: file.url,
    path_archivo: file.path,
    texto_alternativo: productName || file.name,
    orden_visual: index + 1,
    es_portada: !hasCurrentCover && index === 0 && !file.type?.startsWith('video/'),
    es_publica: true,
  }));
