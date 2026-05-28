/**
 * Utilidades para roles y permisos.
 *
 * Los colores no se definen aquí.
 * Los tonos vienen desde:
 * theme.palette.custom.semantic.entityTone
 */

export const MODULE_TONE = {
  pedidos: 'info',
  pagos: 'success',
  inventario: 'warning',
  catalogo: 'emerald',
  marketing: 'brand',
  seguridad: 'danger',
  usuarios: 'emerald',
  envios: 'info',
  cotizaciones: 'brand',
  proveedores: 'warning',
  transportistas: 'info',
  abastecimiento: 'warning',
  reportes: 'neutral',
  otros: 'neutral',
};

export const moduleFromCode = (codigo = '') => codigo.split('.')[0] || 'otros';

export const getModuleColor = (name = '', theme) => {
  const tones = theme?.palette?.custom?.semantic?.entityTone;
  const toneName = MODULE_TONE[name] || 'neutral';

  const fallback = {
    bg: theme?.palette?.action?.selected,
    fg: theme?.palette?.text?.secondary,
    border: theme?.palette?.divider,
  };

  if (!tones) return fallback;

  return tones[toneName] || tones.neutral || fallback;
};

export const groupByModule = (permisos = []) => {
  const map = {};

  for (const p of permisos) {
    const m = moduleFromCode(p.codigo);
    (map[m] = map[m] || []).push(p);
  }

  return Object.entries(map)
    .map(([modulo, items]) => ({ modulo, items }))
    .sort((a, b) => a.modulo.localeCompare(b.modulo));
};

export const fmtDate = (s) =>
  s
    ? new Date(s).toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const backendMsg = (err) => {
  if (!err) return '';

  const data = err?.response?.data;

  return data?.message || data?.details || err?.message || 'Error desconocido';
};