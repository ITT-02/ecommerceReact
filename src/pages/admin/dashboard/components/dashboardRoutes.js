/**
 * Rutas del panel usadas por el dashboard.
 * Si tu proyecto usa otros paths, cambia solo este archivo.
 */
export const DASHBOARD_DETAIL_ROUTES = {
  orders: '/admin/pedidos',
  payments: '/admin/pagos',
  inventory: '/admin/inventario',
  inventoryMovements: '/admin/movimientos',
  promotions: '/admin/promociones',
};

export const buildDashboardDetailPath = (route, { fechaInicio, fechaFin } = {}) => {
  const searchParams = new URLSearchParams();

  if (fechaInicio) searchParams.set('fechaInicio', fechaInicio);
  if (fechaFin) searchParams.set('fechaFin', fechaFin);

  const queryString = searchParams.toString();
  return queryString ? `${route}?${queryString}` : route;
};
