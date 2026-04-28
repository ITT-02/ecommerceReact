/**
 * Configuración de navegación de la tienda pública.
 *
 * Separar estos datos permite reutilizarlos en:
 * - navbar desktop
 * - drawer móvil
 * - menú desplegable de catálogo
 */

export const storeMainMenuItems = [
  { label: 'Inicio', to: '/' },
  { label: 'Nosotros', to: '/nosotros' },
];

export const storeCatalogMenuItems = [
  { label: 'Todos los productos', to: '/catalogo' },
  { label: 'Cajas', to: '/catalogo?categoria=cajas' },
  { label: 'Bolsas', to: '/catalogo?categoria=bolsas' },
];
