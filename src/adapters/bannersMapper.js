import { uploadFile } from '../services/filesService';

const BANNERS_BUCKET = 'banners';
const BANNERS_FOLDER = 'home';

export const BANNER_HOME_PLACEMENT = {
  hero: 'carrusel_principal',
  secondary: 'tarjeta_secundaria',
};

export const BANNER_HOME_PLACEMENT_OPTIONS = [
  {
    value: BANNER_HOME_PLACEMENT.hero,
    label: 'Carrusel principal',
    description: 'Aparece en el espacio horizontal superior y rota automáticamente.',
  },
  {
    value: BANNER_HOME_PLACEMENT.secondary,
    label: 'Tarjeta secundaria',
    description: 'Aparece como tarjeta debajo del carrusel principal.',
  },
];

export const initialBannerFormData = {
  titulo: '',
  subtitulo: '',
  imagen_url: '',
  imagen_path: '',
  url_destino: '/catalogo',
  boton_texto: 'Ver catálogo',
  orden_visual: 0,
  ubicacion_home: BANNER_HOME_PLACEMENT.secondary,
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

const normalizePlacement = (value) => {
  const safeValue = String(value || '').trim();
  return Object.values(BANNER_HOME_PLACEMENT).includes(safeValue)
    ? safeValue
    : BANNER_HOME_PLACEMENT.secondary;
};

export const getBannerPlacementLabel = (value) => {
  return (
    BANNER_HOME_PLACEMENT_OPTIONS.find((option) => option.value === value)?.label ||
    'Tarjeta secundaria'
  );
};

export const mapBannerToFormData = (banner = {}) => ({
  titulo: banner.titulo || '',
  subtitulo: banner.subtitulo || '',
  imagen_url: banner.imagen_url || '',
  imagen_path: banner.imagen_path || '',
  url_destino: banner.url_destino || '/catalogo',
  boton_texto: banner.boton_texto || 'Ver catálogo',
  orden_visual: banner.orden_visual ?? 0,
  ubicacion_home: normalizePlacement(banner.ubicacion_home),
  es_activo: Boolean(banner.es_activo),
  fecha_inicio: toDateInputValue(banner.fecha_inicio),
  fecha_fin: toDateInputValue(banner.fecha_fin),
  _file: null,
});

export const mapFormDataToBanner = async (formData) => {
  let imagenUrl = toNullableText(formData.imagen_url);
  let imagenPath = toNullableText(formData.imagen_path);

  if (formData._file) {
    const uploadedImage = await uploadFile({
      bucket: BANNERS_BUCKET,
      folder: BANNERS_FOLDER,
      file: formData._file,
    });

    imagenUrl = uploadedImage.url;
    imagenPath = uploadedImage.path;
  }

  return {
    titulo: toNullableText(formData.titulo),
    subtitulo: toNullableText(formData.subtitulo),
    imagen_url: imagenUrl,
    imagen_path: imagenPath,
    url_destino: toNullableText(formData.url_destino) || '/catalogo',
    boton_texto: toNullableText(formData.boton_texto) || 'Ver catálogo',
    orden_visual: formData.orden_visual === '' ? 0 : Number(formData.orden_visual),
    ubicacion_home: normalizePlacement(formData.ubicacion_home),
    es_activo: Boolean(formData.es_activo),
    fecha_inicio: toNullableTimestamp(formData.fecha_inicio, 'T00:00:00Z'),
    fecha_fin: toNullableTimestamp(formData.fecha_fin, 'T23:59:59Z'),
  };
};
