// Constantes generales usadas por toda la aplicación.

export const APP_NAME = 'ALIQORA Empaques';

export const DEFAULT_PAGE_SIZE = 20;

/**
 * Imagen de respaldo para productos sin multimedia.
 * SVG inline: fondo neutro con silueta de producto.
 */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">' +
      '<rect width="600" height="450" fill="#FCF9F2"/>' +
      '<rect x="210" y="150" width="180" height="150" rx="12" fill="#E6DFD2"/>' +
      '<circle cx="300" cy="218" r="34" fill="#DDD4C3"/>' +
      '<rect x="240" y="264" width="120" height="14" rx="7" fill="#DDD4C3"/>' +
      '<rect x="266" y="286" width="68" height="10" rx="5" fill="#E6DFD2"/>' +
    '</svg>'
  );
