import { INTERNAL_ROLES, ROLE_PRIORITY, ROLES } from './accessControl';

/**
 * Normaliza roles para evitar errores por mayúsculas o espacios.
 *
 * Ejemplo:
 * [' Administrador '] => ['administrador']
 */
const normalizeRoles = (roles = []) => {
  return roles.map((role) => String(role).trim().toLowerCase());
};

/**
 * Obtiene el rol principal del usuario según prioridad.
 *
 * Ejemplo:
 * roles = ['cliente', 'ventas']
 * Resultado: 'ventas'
 */
export const getMainRole = (roles = []) => {
  const normalizedRoles = normalizeRoles(roles);

  return (
    ROLE_PRIORITY.find((role) => normalizedRoles.includes(role)) ||
    normalizedRoles[0] ||
    ROLES.CLIENTE
  );
};

/**
 * Verifica si el usuario tiene al menos un rol permitido.
 *
 * Ejemplo:
 * userRoles = ['ventas']
 * allowedRoles = ['administrador', 'ventas']
 * Resultado: true
 */
export const hasAllowedRole = (userRoles = [], allowedRoles = []) => {
  const normalizedUserRoles = normalizeRoles(userRoles);
  const normalizedAllowedRoles = normalizeRoles(allowedRoles);

  return normalizedAllowedRoles.some((role) =>
    normalizedUserRoles.includes(role),
  );
};

/**
 * Verifica si el usuario tiene algún rol interno.
 *
 * Los roles internos pueden entrar al panel administrativo.
 */
export const hasInternalRole = (roles = []) => {
  return hasAllowedRole(roles, INTERNAL_ROLES);
};

/**
 * Obtiene la ruta inicial según los roles del usuario.
 *
 * Si tiene rol interno, entra al panel administrativo.
 * Si no, entra a la tienda.
 */
export const getDefaultPathByRoles = (roles = []) => {
  return hasInternalRole(roles) ? '/admin/dashboard' : '/';
};