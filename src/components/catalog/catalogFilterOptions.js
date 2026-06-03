export const PRODUCT_TYPE_OPTIONS = [
  { value: 'compra_directa', label: 'Compra directa' },
  { value: 'cotizacion', label: 'Cotización' },
  { value: 'bajo_pedido', label: 'Bajo pedido' },
];

export const AVAILABILITY_OPTIONS = [
  { value: 'disponible', label: 'Con stock' },
  { value: 'bajo_pedido', label: 'Bajo pedido' },
  { value: 'sin_stock', label: 'Sin stock' },
];

export const DEFAULT_ORDER_VALUE = 'recientes';

export const ORDER_OPTIONS = [
  { value: 'nombre_asc', label: 'Nombre A-Z' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
];

export const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'Sí' },
  { value: 'false', label: 'No' },
];

export const getFilterOptionLabel = (options, value) =>
  options.find((item) => String(item.value) === String(value))?.label || '';