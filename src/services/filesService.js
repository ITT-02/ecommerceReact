import { storageApi } from '../api/storageApi';
import { ENV } from '../config/env';

/**
 * Servicio para manejar archivos.
 *  para:
 * - imágenes de categorías
 * - imágenes/videos de productos
 * - banners
 * - comprobantes
 * - PDFs
    subir, eliminar y construir URLs de archivos.
 */

/**
 * Limpia el nombre del archivo.
 * en minúsculas, sin espacios ni caracteres especiales
 */
const cleanFileName = (fileName) =>
  fileName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9.-]/g, '');

/**
 * Construye la ruta interna donde se guardará el archivo.
 *
 * Ejemplo:
 * folder: 'categorias'
 * file.name: 'Caja Kraft.png'
 * categorias/1712345678900-caja-kraft.png
 */
const buildFilePath = ({ folder, file }) => {
  const fileName = `${Date.now()}-${cleanFileName(file.name)}`;
  return `${folder}/${fileName}`;
};

/**
 * Construye la URL pública del archivo.
 * Solo funcionará si el bucket está configurado como público.
 */
export const getPublicFileUrl = ({ bucket, path }) => {
  return `${ENV.STORAGE_BASE_URL}/object/public/${bucket}/${path}`;
};

/**
 * Subir archivo
 */
export const uploadFile = async ({ bucket, folder, file }) => {
  if (!file) return null;

  const path = buildFilePath({ folder, file });
  console.log(file.type);
  console.log(path);
  console.log("SUBIENDO A:", { bucket, folder, path });
  await storageApi.post(`/object/${bucket}/${path}`, file, {
    headers: {
      // Indica el tipo real del archivo: image/png, video/mp4, application/pdf, etc.
      'Content-Type': file.type,
    },
  });

  return {
    bucket, // Bucket donde se guardó.
    path, // Ruta interna. Útil para eliminar o reemplazar.
    url: getPublicFileUrl({ bucket, path }), // URL para mostrar el archivo.
    name: file.name, // Nombre original.
    type: file.type, // Tipo
    size: file.size, // Tamaño en bytes.
  };
};

/**
 * Subir varios archivos.
 * Sirve para productos con varias imágenes/videos.
 */
export const uploadFiles = async ({ bucket, folder, files = [] }) => {
  if (!files) return [];

  const fileList = Array.isArray(files) ? files : [files];

  const uploadedFiles = await Promise.all(
    fileList.map((file) =>
      uploadFile({
        bucket,
        folder,
        file,
      })
    )
  );

  return uploadedFiles;
};

/**
 * Eliminar archivo.
 */
export const deleteFile = async ({ bucket, path }) => {
  if (!bucket || !path) return;

  await storageApi.delete(`/object/${bucket}/${path}`);
};

/**
 * Reemplazar archivo existente.
 */
export const replaceFile = async ({ bucket, folder, newFile, oldPath }) => {
  if (!newFile) return null;

  const uploadedFile = await uploadFile({
    bucket,
    folder,
    file: newFile,
  });

  if (oldPath) {
    await deleteFile({ bucket, path: oldPath });
  }

  return uploadedFile;
};