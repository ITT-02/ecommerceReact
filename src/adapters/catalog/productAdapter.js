// Adapta datos entre el formulario de producto y el servicio.

export const initialProductFormData = {
  categoria_id: '',
  nombre: '',
  descripcion_corta: '',
  descripcion_larga: '',
  mostrar_precio: true,
  destacado: false,
  es_personalizable: false,
  requiere_cotizacion: false,
  es_activo: true,
  mediaFiles: [],
  newMediaFiles: [],
  removedMediaIds: [],
  removedMedia: [],
};

export const productToFormData = (product = {}) => ({
  categoria_id: product.categoria_id || '',
  nombre: product.nombre || '',
  descripcion_corta: product.descripcion_corta || '',
  descripcion_larga: product.descripcion_larga || '',
  mostrar_precio: product.mostrar_precio ?? true,
  destacado: Boolean(product.destacado),
  es_personalizable: Boolean(product.es_personalizable),
  requiere_cotizacion: Boolean(product.requiere_cotizacion),
  es_activo: product.es_activo ?? true,
  mediaFiles: [],
  newMediaFiles: product.producto_multimedia || product.multimedia || [],
  removedMediaIds: [],
  removedMedia: [],
});

export const formDataToProductPayload = (formData) => ({
  categoria_id: formData.categoria_id || null,
  nombre: formData.nombre.trim(),
  descripcion_corta: formData.descripcion_corta.trim() || null,
  descripcion_larga: formData.descripcion_larga.trim() || null,
  mostrar_precio: Boolean(formData.mostrar_precio),
  destacado: Boolean(formData.destacado),
  es_personalizable: Boolean(formData.es_personalizable),
  requiere_cotizacion: Boolean(formData.requiere_cotizacion),
  es_activo: Boolean(formData.es_activo),
  mediaFiles: formData.mediaFiles || [],
  newMediaFiles: formData.newMediaFiles || [],
  removedMediaIds: formData.removedMediaIds || [],
  removedMedia: formData.removedMedia || [],
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
  destacado: Boolean(product.destacado),
  es_personalizable: Boolean(product.es_personalizable),
  requiere_cotizacion: Boolean(product.requiere_cotizacion),
  es_activo: Boolean(product.es_activo),
});

export const isLocalFile = (file) => file instanceof File;

export const getLocalFiles = (files = []) => {
  const fileList = Array.isArray(files) ? files : [files];
  return fileList.filter(isLocalFile);
};

export const mapUploadedFilesToProductMultimedia = (
  uploadedFiles,
  productName,
  hasCurrentCover = false
) =>
  uploadedFiles.map((file, index) => ({
    tipo_multimedia: file.type?.startsWith('video/') ? 'video' : 'imagen',
    url_archivo: file.url,
    path_archivo: file.path,
    texto_alternativo: productName || file.name,
    orden_visual: index + 1,
    es_portada: !hasCurrentCover && index === 0 && !file.type?.startsWith('video/'),
    es_publica: true,
  }));
