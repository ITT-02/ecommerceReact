/**
 * Datos iniciales del formulario de opciones de personalización.
 */
export const initialCustomizationOptionForm = {
  id: null,
  codigo: '',
  nombre: '',
  descripcion: '',
  tipo_campo: 'texto',
  acepta_archivo: false,
  opcionesTexto: '',
  orden_visual: 0,
  es_activo: true,
};

/**
 * Normaliza el código interno para que sea estable y compatible con backend.
 */
export const normalizeCode = (value = '') =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

/**
 * Normaliza textos para búsquedas locales.
 */
export const normalizeText = (value = '') =>
  value?.toString().trim().toLowerCase() || '';

/**
 * Convierte una opción guardada en datos editables para el formulario.
 */
export const optionToForm = (option = {}) => ({
  id: option.id || null,
  codigo: option.codigo || '',
  nombre: option.nombre || '',
  descripcion: option.descripcion || '',
  tipo_campo: option.tipo_campo || 'texto',
  acepta_archivo: Boolean(option.acepta_archivo),
  opcionesTexto: Array.isArray(option.opciones_json)
    ? option.opciones_json.join('\n')
    : '',
  orden_visual: option.orden_visual ?? 0,
  es_activo: option.es_activo ?? true,
});

/**
 * Convierte el formulario en payload limpio para crear o actualizar.
 */
export const formToPayload = (form) => {
  const { opcionesTexto, ...rest } = form;

  const payload = {
    ...rest,
    codigo: normalizeCode(form.codigo || form.nombre),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion?.trim() || null,
    orden_visual: Number(form.orden_visual) || 0,
    acepta_archivo: Boolean(form.acepta_archivo),
    es_activo: Boolean(form.es_activo),
    opciones_json: opcionesTexto
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
  };

  if (!payload.id) {
    delete payload.id;
  }

  return payload;
};