// Validaciones reutilizables para formularios.
// Uso: contacto, login, registro, perfil, direcciones, clientes y formularios admin.

export const trimText = (value = '') => String(value || '').trim();

export const getOnlyDigits = (value = '') => String(value || '').replace(/\D/g, '');

export const isRequired = (value) => trimText(value).length > 0;

export const isEmail = (value) => {
  const email = trimText(value);

  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
};

export const isPhone = (
  value,
  { minDigits = 9, maxDigits = 15, optional = true } = {},
) => {
  const phone = trimText(value);

  if (!phone) return Boolean(optional);

  const allowedFormat = /^[0-9+\-\s()]+$/.test(phone);
  const digits = getOnlyDigits(phone);

  return allowedFormat && digits.length >= minDigits && digits.length <= maxDigits;
};

export const hasFieldErrors = (errors = {}) => {
  return Object.values(errors).some(Boolean);
};

export const validateRequiredTextField = (
  value,
  label = 'campo',
  { minLength = 1, rejectOnlyNumbers = false } = {},
) => {
  const text = trimText(value);

  if (!text) return `Ingresa ${label}.`;

  if (text.length < minLength) {
    return `${label} debe tener al menos ${minLength} caracteres.`;
  }

  if (rejectOnlyNumbers && /^\d+$/.test(text)) {
    return `${label} no puede contener solo números.`;
  }

  return '';
};

export const validateEmailField = (value, label = 'correo electrónico') => {
  const email = trimText(value);

  if (!email) return `Ingresa tu ${label}.`;

  if (!isEmail(email)) {
    return `Ingresa un ${label} válido. Ejemplo: nombre@correo.com`;
  }

  return '';
};

export const validatePhoneField = (
  value,
  label = 'teléfono',
  { minDigits = 9, maxDigits = 15, optional = true } = {},
) => {
  const phone = trimText(value);

  if (!phone && optional) return '';

  if (!phone && !optional) {
    return `Ingresa tu ${label}.`;
  }

  if (!/^[0-9+\-\s()]+$/.test(phone)) {
    return `El ${label} solo puede contener números, espacios, +, guiones o paréntesis.`;
  }

  const digits = getOnlyDigits(phone);

  if (digits.length < minDigits) {
    return `El ${label} debe tener al menos ${minDigits} dígitos.`;
  }

  if (digits.length > maxDigits) {
    return `El ${label} no puede exceder los ${maxDigits} dígitos.`;
  }

  return '';
};

export const validatePasswordField = (
  value,
  label = 'contraseña',
  { minLength = 8 } = {},
) => {
  if (!value) return `Ingresa tu ${label}.`;

  if (String(value).length < minLength) {
    return `La ${label} debe tener mínimo ${minLength} caracteres.`;
  }

  return '';
};
export const sanitizePhoneInput = (value = '') => {
  return String(value || '').replace(/[^0-9+\-\s()]/g, '');
};