/**
 * Normaliza errores de API sin acoplar el frontend a un proveedor específico.
 */
export const normalizeApiError = (error) => {
  if (!error) return '';

  const data = error?.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors
      .map((item) => {
        if (typeof item === 'string') return item;

        const field = item?.field || item?.path || item?.property;
        const message = item?.message || item?.error || item?.detail;

        if (field && message) return `${field}: ${message}`;
        return message || field || '';
      })
      .filter(Boolean)
      .join('\n');
  }

  return (
    data?.message ||
    data?.error_description ||
    data?.error ||
    data?.details ||
    data?.hint ||
    error?.message ||
    'No se pudo completar la operación.'
  );
};
