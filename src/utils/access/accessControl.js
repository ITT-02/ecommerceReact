/**
 * Roles disponibles en el sistema.
 *
 * Estos valores deben coincidir exactamente con los roles que devuelve el backend.
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMINISTRADOR: 'administrador',
  CATALOGO: 'catalogo',
  INVENTARIO: 'inventario',
  VENTAS: 'ventas',
  MARKETING: 'marketing',
};

/**
 * Prioridad de roles.
 *
 * Si un usuario tiene varios roles, se toma primero el rol más importante.
 * Ejemplo:
 * ['cliente', 'ventas'] => 'ventas'
 */
export const ROLE_PRIORITY = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.CATALOGO,
  ROLES.INVENTARIO,
  ROLES.VENTAS,
  ROLES.MARKETING,
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
];

/**
 * Roles que tienen acceso general de administrador.
 */
export const ADMIN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
];

/**
 * Roles permitidos para ver el dashboard.
 */
export const DASHBOARD_ROLES = INTERNAL_ROLES;

/**
 * Roles permitidos para el módulo catálogo.
 */
export const CATALOG_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.CATALOGO,
];

/**
 * Roles permitidos para el módulo inventario.
 */
export const INVENTORY_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.INVENTARIO,
];

/**
 * Roles permitidos para el módulo ventas.
 */
export const SALES_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.VENTAS,
];

/**
 * Roles permitidos para el módulo marketing.
 */
export const MARKETING_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRADOR,
  ROLES.MARKETING,
];