export const initialBannerFormData = {
  titulo: '',
  subtitulo: '',
  imagen_url: '',
  url_destino: '',
  boton_texto: '',
  orden_visual: '',
  es_activo: true,
  fecha_inicio: '',
  fecha_fin: '',
  _file: null,
};

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

const toNullableTimestamp = (value, fallbackTime) => {
  if (!value) return null;
  if (value.includes('T')) return value;
  return `${value}${fallbackTime}`;
};

const toNullableText = (value) => {
  const trimmed = value?.trim?.() ?? '';
  return trimmed || null;
};

export const mapBannerToFormData = (banner) => ({
  titulo: banner.titulo || '',
  subtitulo: banner.subtitulo || '',
  imagen_url: banner.imagen_url || '',
  url_destino: banner.url_destino || '',
  boton_texto: banner.boton_texto || '',
  orden_visual: banner.orden_visual ?? '',
  es_activo: Boolean(banner.es_activo),
  fecha_inicio: toDateInputValue(banner.fecha_inicio),
  fecha_fin: toDateInputValue(banner.fecha_fin),
  _file: null,
});

export const mapFormDataToBanner = (formData) => ({
  titulo: toNullableText(formData.titulo),
  subtitulo: toNullableText(formData.subtitulo),
  imagen_url: toNullableText(formData.imagen_url),
  url_destino: toNullableText(formData.url_destino),
  boton_texto: toNullableText(formData.boton_texto),
  orden_visual: formData.orden_visual === '' ? 0 : Number(formData.orden_visual),
  es_activo: Boolean(formData.es_activo),
  fecha_inicio: toNullableTimestamp(formData.fecha_inicio, 'T00:00:00Z'),
  fecha_fin: toNullableTimestamp(formData.fecha_fin, 'T23:59:59Z'),
});
