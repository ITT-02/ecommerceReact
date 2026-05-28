// Adaptadores de pedidos.
// Separa estado operativo del pedido, estado de pago y estado de envío.

export const checkoutFormToOrderPayload = (formData) => ({
  p_direccion_id: formData.direccion_id || null,
  p_metodo_pago: formData.metodo_pago || null,
  p_notas_cliente: formData.notas_cliente?.trim() || null,
});

export const ORDER_STATUS_OPTIONS = [
  { value: 'pendiente_pago', label: 'Pendiente de pago' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'listo_para_envio', label: 'Listo para entrega/despacho' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const OPERATIONAL_ORDER_STATUS_OPTIONS = ORDER_STATUS_OPTIONS.filter(
  (option) => option.value !== 'cancelado'
);

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'validando', label: 'Validando' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'cancelado', label: 'Cancelado' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'reembolso_pendiente', label: 'Reembolso pendiente' },
  { value: 'reembolsado', label: 'Reembolsado' },
];

export const SHIPPING_STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'entregado_repartidora', label: 'Entregado a transportista' },
  { value: 'en_transito', label: 'En tránsito' },
  { value: 'en_destino', label: 'En destino' },
  { value: 'entregado', label: 'Entregado al cliente' },
  { value: 'incidencia', label: 'Incidencia' },
];


export const SHIPPING_ADVANCE_VALUES = [
  'entregado_repartidora',
  'en_transito',
  'en_destino',
  'entregado',
  'incidencia',
];

export const SHIPPING_REQUIRED_ADVANCE_VALUES = [
  'entregado_repartidora',
  'en_transito',
  'en_destino',
  'entregado',
];

export const ADVANCE_STATUS_OPTIONS = [
  { value: 'pedido:pendiente_pago', label: 'Pedido: pendiente de pago' },
  { value: 'pedido:confirmado', label: 'Pedido: confirmado' },
  { value: 'pedido:en_preparacion', label: 'Pedido: en preparación' },
  { value: 'pedido:listo_para_envio', label: 'Pedido: listo para entrega/despacho' },
  { value: 'pedido:entregado', label: 'Pedido: entregado directamente' },
  { value: 'envio:entregado_repartidora', label: 'Envío: entregado a transportista' },
  { value: 'envio:en_transito', label: 'Envío: en tránsito' },
  { value: 'envio:en_destino', label: 'Envío: en destino' },
  { value: 'envio:entregado', label: 'Envío: entregado al cliente' },
  { value: 'envio:incidencia', label: 'Envío: incidencia' },
];

export const ORDER_STATUS_COLOR = {
  pendiente_pago: 'warning',
  confirmado: 'info',
  en_preparacion: 'info',
  listo_para_envio: 'secondary',
  enviado: 'secondary',
  entregado: 'success',
  cancelado: 'error',
};

export const PAYMENT_STATUS_COLOR = {
  pendiente: 'warning',
  validando: 'info',
  pagado: 'success',
  rechazado: 'error',
  cancelado: 'default',
  vencido: 'error',
  reembolso_pendiente: 'warning',
  reembolsado: 'info',
};

export const SHIPPING_STATUS_COLOR = {
  pendiente: 'default',
  preparando: 'info',
  entregado_repartidora: 'secondary',
  en_transito: 'secondary',
  en_destino: 'secondary',
  entregado: 'success',
  incidencia: 'error',
};

const LEGACY_ORDER_STATUS_LABELS = {
  pendiente: 'Pendiente de pago',
  pagado: 'Confirmado',
  preparando: 'En preparación',
};

const findLabel = (options, value) => {
  if (!value) return '-';
  return options.find((option) => option.value === value)?.label || LEGACY_ORDER_STATUS_LABELS[value] || value;
};

export const getOrderStatusLabel = (status) => findLabel(ORDER_STATUS_OPTIONS, status);
export const getPaymentStatusLabel = (status) => findLabel(PAYMENT_STATUS_OPTIONS, status);
export const getShippingStatusLabel = (status) => findLabel(SHIPPING_STATUS_OPTIONS, status);

export const normalizeOrdersPaginatedResponse = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? value?.data ?? value?.registros ?? [];
  const totalCount = value?.totalCount ?? value?.total_count ?? value?.total ?? items.length;
  const currentPage = value?.pageNumber ?? value?.page_number ?? value?.pagina_actual ?? pageNumber;
  const currentPageSize = value?.pageSize ?? value?.page_size ?? value?.tamano_pagina ?? pageSize;
  const totalPages =
    value?.totalPages ??
    value?.total_pages ??
    Math.max(Math.ceil(totalCount / Math.max(currentPageSize, 1)), 1);

  return {
    items,
    totalCount,
    pageNumber: currentPage,
    pageSize: currentPageSize,
    totalPages,
    hasPreviousPage: value?.hasPreviousPage ?? value?.has_previous_page ?? currentPage > 1,
    hasNextPage: value?.hasNextPage ?? value?.has_next_page ?? currentPage < totalPages,
  };
};

export const normalizeOrderDetail = (detail = {}) => ({
  ...detail,
  items: detail.items || detail.pedido_items || [],
  pagos: detail.pagos || [],
  reembolsos: detail.reembolsos || [],
  historial_estados: detail.historial_estados || detail.pedido_historial_estados || [],
});

export const mapOrderStatusFormToPayload = (form) => ({
  pedidoId: form.pedidoId,
  estadoNuevo: form.estadoNuevo,
  comentario: form.comentario?.trim() || null,
});

export const mapCancelOrderFormToPayload = (form) => ({
  pedidoId: form.pedidoId,
  motivo: form.motivo?.trim() || '',
  comentario: form.comentario?.trim() || null,
});

export const mapReopenOrderFormToPayload = (form) => ({
  pedidoId: form.pedidoId,
  motivo: form.motivo?.trim() || '',
  nuevaFechaLimitePago: form.nuevaFechaLimitePago || null,
});

export const mapRefundFormToPayload = (form) => ({
  pedidoId: form.pedidoId,
  pagoId: form.pagoId || null,
  monto: Number(form.monto || 0),
  metodoReembolso: form.metodoReembolso?.trim() || '',
  referenciaReembolso: form.referenciaReembolso?.trim() || null,
  motivo: form.motivo?.trim() || '',
});
