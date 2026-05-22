export const MODULE_COLORS = {
  pedidos:    { bg: '#e3f0ff', fg: '#0b4ea8' },
  pagos:      { bg: '#e8f7ec', fg: '#1f6f3b' },
  inventario: { bg: '#fff1e0', fg: '#a04a00' },
  catalogo:   { bg: '#f0e9ff', fg: '#5b2bbf' },
  marketing:  { bg: '#ffe7f0', fg: '#a3104f' },
  otros:      { bg: '#eef0f4', fg: '#475569' },
};

export const moduleFromCode = (codigo = '') => codigo.split('.')[0] || 'otros';

export const getModuleColor = (name = '') =>
  MODULE_COLORS[name] || MODULE_COLORS.otros;

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