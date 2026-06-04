// Servicios públicos y administrativos para configuración visible de la tienda.

import { restApi } from '../../api/restApi';

export const DEFAULT_STORE_SETTINGS = {
  id: null,
  nombre_tienda: '',
  slogan: 'Empaques premium para tu marca',
  telefono_atencion: '',
  correo_atencion: '',
  whatsapp: '',
  direccion: '',
  mensaje_topbar: 'Empaques premium para cajas, bolsas y presentación de marca',
  logo_url: '',
  logo_path: '',
  color_primario: '',
  color_secundario: '',
  metadata: {
    mensaje_topbar_derecha: '',
    mensaje_whatsapp_default: 'Hola, quisiera recibir información sobre sus empaques.',
    horario_atencion: 'Lunes a sábado de 9:00 a 18:00',
    mostrar_whatsapp_flotante: true,
  },
};

const normalizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { ...DEFAULT_STORE_SETTINGS.metadata };
  }

  return {
    ...DEFAULT_STORE_SETTINGS.metadata,
    ...metadata,
  };
};

export const normalizeStoreSettings = (settings = {}) => ({
  ...DEFAULT_STORE_SETTINGS,
  ...settings,
  metadata: normalizeMetadata(settings?.metadata),
});

export const getPublicStoreSettings = async () => {
  const response = await restApi.post('/rpc/obtener_configuracion_tienda_publica', {});
  const value = Array.isArray(response.data) ? response.data[0] : response.data;

  return normalizeStoreSettings(value || {});
};

export const saveAdminStoreSettings = async (settings) => {
  const response = await restApi.post('/rpc/guardar_configuracion_tienda_admin', {
    p_configuracion: {
      ...settings,
      metadata: normalizeMetadata(settings?.metadata),
    },
  });

  return normalizeStoreSettings(response.data || {});
};

export const normalizeWhatsAppNumber = (value = '') => {
  const onlyDigits = String(value).replace(/\D/g, '');

  if (!onlyDigits) return '';
  if (onlyDigits.startsWith('51')) return onlyDigits;
  if (onlyDigits.length === 9) return `51${onlyDigits}`;

  return onlyDigits;
};

export const buildWhatsAppUrl = ({ phone = '', message = '' } = {}) => {
  const normalizedPhone = normalizeWhatsAppNumber(phone);

  if (!normalizedPhone) return '';

  const cleanMessage = String(
    message || DEFAULT_STORE_SETTINGS.metadata.mensaje_whatsapp_default
  ).trim();

  return `https://wa.me/${normalizedPhone}${
    cleanMessage ? `?text=${encodeURIComponent(cleanMessage)}` : ''
  }`;
};