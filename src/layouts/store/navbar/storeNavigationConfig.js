/**
 * Configuración de navegación de la tienda pública.
 *
 * Se separa el catálogo porque en desktop se muestra como menú desplegable,
 * mientras que las demás páginas son enlaces directos.
 */

export const storeMainMenuItems = [
  { label: 'Inicio', to: '/' },
];

export const storeAfterCatalogMenuItems = [
  { label: 'Mayoristas', to: '/mayoristas' },
  { label: 'Nuestra Historia', to: '/nuestra-historia' },
  { label: 'Contacto', to: '/contacto' },
];

export const storeCatalogMenuItems = [
  { label: 'Todos los productos', to: '/catalogo' },
  { label: 'Compra directa', to: '/catalogo?tipo=compra_directa' },
  { label: 'Bajo pedido', to: '/catalogo?tipo=bajo_pedido' },
  { label: 'Productos destacados', to: '/catalogo?destacado=true' },
];

export const storeCustomerMenuItems = [
  { label: 'Mi perfil', to: '/perfil' },
  { label: 'Mis pedidos', to: '/mis-pedidos' },
  { label: 'Mis cotizaciones', to: '/mis-cotizaciones' },
  { label: 'Mis solicitudes', to: '/mis-solicitudes' },
  { label: 'Mis direcciones', to: '/direcciones' },
];