// Servicio de productos base y multimedia.

import { restApi } from '../../api/restApi';
import {
  getLocalFiles,
  isLocalFile,
  mapProductToRpcPayload,
  mapUploadedFilesToProductMultimedia,
  normalizeProductPaginatedResponse,
} from '../../adapters/catalog/productAdapter';
import { deleteFile, uploadFiles } from '../filesService';

const PRODUCT_MEDIA_BUCKET = 'product-media';
const PRODUCT_MEDIA_FOLDER = 'productos';

const uploadProductMedia = async ({ files, productName, hasCurrentCover = false }) => {
  const localFiles = getLocalFiles(files);

  if (!localFiles.length) return [];

  const uploadedFiles = await uploadFiles({
    bucket: PRODUCT_MEDIA_BUCKET,
    folder: PRODUCT_MEDIA_FOLDER,
    files: localFiles,
  });

  return mapUploadedFilesToProductMultimedia(uploadedFiles, productName, hasCurrentCover);
};

const deleteRemovedMediaFromStorage = async (removedMedia = []) => {
  const mediaToDelete = removedMedia.filter((media) => media?.path_archivo);

  await Promise.all(
    mediaToDelete.map((media) =>
      deleteFile({
        bucket: media.bucket || PRODUCT_MEDIA_BUCKET,
        path: media.path_archivo,
      })
    )
  );
};

export const getProducts = async ({
  pageNumber = 1,
  pageSize = 10,
  search = '',
  categoriaId = null,
  esActivo = null,
  destacado = null,
  requiereCotizacion = null,
} = {}) => {
  const response = await restApi.post('/rpc/listar_productos_paginado', {
    p_page_number: pageNumber,
    p_page_size: pageSize,
    p_search: search,
    p_categoria_id: categoriaId,
    p_es_activo: esActivo,
    p_destacado: destacado,
    p_requiere_cotizacion: requiereCotizacion,
  });

  return normalizeProductPaginatedResponse(response.data, pageNumber, pageSize);
};

export const getProductById = async (id) => {
  const response = await restApi.post('/rpc/obtener_producto_con_multimedia', {
    p_producto_id: id,
  });

  return Array.isArray(response.data) ? response.data[0] : response.data;
};

export const getCategoryOptions = async () => {
  const response = await restApi.get('/categorias', {
    params: {
      select: 'id,nombre',
      es_activa: 'eq.true',
      order: 'nombre.asc',
    },
  });

  return response.data;
};

export const createProduct = async (product) => {
  const p_producto = mapProductToRpcPayload(product);
  const p_multimedia = await uploadProductMedia({
    files: product.mediaFiles,
    productName: product.nombre,
  });

  const response = await restApi.post('/rpc/crear_producto_con_multimedia', {
    p_producto,
    p_multimedia,
  });

  return response.data;
};

export const updateProduct = async (id, product) => {
  const p_producto = mapProductToRpcPayload(product);
  const currentMedia = (product.newMediaFiles || []).filter((media) => !isLocalFile(media));
  const hasCurrentCover = currentMedia.some((media) => Boolean(media.es_portada));
  const p_multimedia_nueva = await uploadProductMedia({
    files: product.newMediaFiles,
    productName: product.nombre,
    hasCurrentCover,
  });

  const response = await restApi.post('/rpc/actualizar_producto_con_multimedia', {
    p_producto_id: id,
    p_producto,
    p_multimedia_nueva,
    p_multimedia_eliminada: product.removedMediaIds || [],
  });

  await deleteRemovedMediaFromStorage(product.removedMedia);

  return response.data;
};

export const deactivateProduct = async (product) => {
  const response = await restApi.patch(
    '/productos',
    { es_activo: false },
    {
      params: { id: `eq.${product.id}`, select: '*' },
      headers: { Prefer: 'return=representation' },
    }
  );

  return response.data[0] || null;
};

export const deleteProduct = async (product) => {
  const response = await restApi.delete('/productos', {
    params: { id: `eq.${product.id}` },
  });

  return response.data;
};
