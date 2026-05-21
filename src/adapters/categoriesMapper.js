import { uploadFile } from '../services/filesService';

const CATEGORIES_BUCKET = 'category-images';
const CATEGORIES_FOLDER = 'images';

/**
 * Datos iniciales para el formulario de categorías
 */
export const initialCategoryFormData = {
  categoria_padre_id: null,
  nombre: '',
  descripcion: '',
  orden_visual: 1,
  icono: '',
  es_visible: true,
  es_activa: true,
  imagen_url: '',
  imagen_path: '',
  _file: null, // Archivo seleccionado localmente
};

/**
 * Convierte datos de categoría a datos de formulario
 */
export const mapCategoryToFormData = (category) => ({
  categoria_padre_id: category.categoria_padre_id ?? null,
  nombre: category.nombre || '',
  descripcion: category.descripcion || '',
  orden_visual: category.orden_visual ?? 1,
  icono: category.icono || '',
  es_visible: category.es_visible ?? true,
  es_activa: category.es_activa ?? true,
  imagen_url: category.imagen_url || '',
  imagen_path: category.imagen_path || '',
  _file: null, // Siempre null para edición (nueva selección)
});

/**
 * Convierte datos de formulario a datos de API
 * Maneja el upload de imagen si existe _file
 */
export const mapFormDataToCategory = async (formData) => {
  let imagen_url = formData.imagen_url || null;
  let imagen_path = formData.imagen_path || null;

  // Si hay un archivo nuevo, subirlo
  if (formData._file) {
    const uploadedImage = await uploadFile({
      bucket: CATEGORIES_BUCKET,
      folder: CATEGORIES_FOLDER,
      file: formData._file,
    });

    imagen_url = uploadedImage.url;
    imagen_path = uploadedImage.path;
  }

  return {
    categoria_padre_id: formData.categoria_padre_id || null,
    nombre: formData.nombre?.trim() || null,
    descripcion: formData.descripcion?.trim() || null,
    imagen_url,
    imagen_path,
    icono: formData.icono?.trim() || null,
    color_hex: formData.color_hex || null,
    orden_visual: formData.orden_visual === '' ? 0 : Number(formData.orden_visual),
    es_visible: Boolean(formData.es_visible),
    es_activa: Boolean(formData.es_activa),
  };
};
