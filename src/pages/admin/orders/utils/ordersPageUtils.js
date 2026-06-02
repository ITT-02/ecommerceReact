import { SHIPPING_REQUIRED_ADVANCE_VALUES } from '../../../../adapters/orderAdapter';

export const formatDate = (value) => {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 16);
};

export const formatCurrency = (value) => `S/ ${Number(value ?? 0).toFixed(2)}`;

export const isImageUrl = (url = '') => /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url.split('?')[0]);

export const normalizeObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

export const getAdvanceType = (value = '') => value.split(':')[0] || '';

export const getAdvanceStatus = (value = '') => value.split(':')[1] || '';

export const isShippingAdvance = (value = '') => getAdvanceType(value) === 'envio';

export const getTargetOrderStatus = (avanceNuevo = '') => {
  const advanceStatus = getAdvanceStatus(avanceNuevo);

  if (!isShippingAdvance(avanceNuevo)) return advanceStatus;
  if (advanceStatus === 'entregado') return 'entregado';

  return 'enviado';
};

export const requiresTransportData = (avanceNuevo = '') =>
  isShippingAdvance(avanceNuevo) && SHIPPING_REQUIRED_ADVANCE_VALUES.includes(getAdvanceStatus(avanceNuevo));
