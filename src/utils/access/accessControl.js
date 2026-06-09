/**
 * Roles disponibles en el sistema.
 * Estos valores deben coincidir exactamente con los roles que devuelve el backend.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMINISTRADOR: 'administrador',
  CATALOGO: 'catalogo',
  INVENTARIO: 'inventario',
  VENTAS: 'ventas',
  MARKETING: 'marketing',
  SOCIO_COMERCIAL: 'socio_comercial',
  CLIENTE: 'cliente',
};

/**
 * Prioridad de roles.
 * Si un usuario tiene varios roles, se toma primero el rol más importante.
 */
export const ROLE_PRIORITY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.CATALOGO,
  ROLES.INVENTARIO,
  ROLES.VENTAS,
  ROLES.MARKETING,
  ROLES.SOCIO_COMERCIAL,
  ROLES.CLIENTE,
];

/**
 * Roles internos que pueden entrar al panel administrativo.
 */
export const INTERNAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.CATALOGO,
  ROLES.INVENTARIO,
  ROLES.VENTAS,
  ROLES.MARKETING,
  ROLES.SOCIO_COMERCIAL,
];

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR];
export const DASHBOARD_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.CATALOGO,
  ROLES.INVENTARIO,
  ROLES.VENTAS,
  ROLES.MARKETING,
];
export const CATALOG_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.CATALOGO];
export const INVENTORY_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.INVENTARIO];
export const SALES_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.VENTAS];
export const MARKETING_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.MARKETING];
export const PARTNER_ROLES = [ROLES.SOCIO_COMERCIAL];
export const PARTNER_REVIEW_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.CATALOGO];

/**
 * Finanzas permite revisar utilidad, margen, ventas pagadas y rentabilidad.
 * Se habilita para administradores y ventas porque ventas necesita controlar cierre comercial.
 */
export const FINANCE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRADOR, ROLES.VENTAS];
