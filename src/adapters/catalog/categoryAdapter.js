// Adapta datos de categorías y subcategorías.
// No se envía slug porque la base lo genera automáticamente.

export const initialCategoryFormData = {
  categoria_padre_id: '',
  nombre: '',
  descripcion: '',
  imagen_url: '',
  icono: '',
  color_hex: '',
  orden_visual: 0,
  es_visible: true,
  es_activa: true,
};

export const formDataToCategoryPayload = (formData) => ({
  categoria_padre_id: formData.categoria_padre_id || null,
  nombre: formData.nombre.trim(),
  descripcion: formData.descripcion.trim() || null,
  imagen_url: formData.imagen_url.trim() || null,
  icono: formData.icono.trim() || null,
  color_hex: formData.color_hex.trim() || null,
  orden_visual: Number(formData.orden_visual || 0),
  es_visible: formData.es_visible,
  es_activa: formData.es_activa,
});
