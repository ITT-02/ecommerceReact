import dayjs from 'dayjs';

export const toYYYYMMDD = (value) => {
  if (!value) return null;
  if (typeof value === 'string') {
    // Si ya viene en YYYY-MM-DD, lo respetamos si es válido.
    const d = dayjs(value, 'YYYY-MM-DD', true);
    if (!d.isValid()) return null;
    return d.format('YYYY-MM-DD');
  }

  // Si es Date o dayjs
  const d = dayjs(value);
  if (!d.isValid()) return null;
  return d.format('YYYY-MM-DD');
};

