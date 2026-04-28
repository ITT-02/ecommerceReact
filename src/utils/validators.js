// Validaciones reutilizables para formularios.

export const isRequired = (value) => String(value || '').trim().length > 0;

export const isEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
};

export const isPositiveNumber = (value) => {
  return Number(value) > 0;
};
