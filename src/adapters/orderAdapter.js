// Adapta datos de checkout a payload de pedido.

export const checkoutFormToOrderPayload = (formData) => ({
  p_direccion_id: formData.direccion_id || null,
  p_metodo_pago: formData.metodo_pago || null,
  p_notas_cliente: formData.notas_cliente?.trim() || null,
});

export const ORDER_STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
];

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagado', label: 'Pagado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'reembolsado', label: 'Reembolsado' },
];

export const ORDER_STATUS_COLOR = {
  pendiente: 'warning',
  confirmado: 'info',
  pagado: 'success',
  preparando: 'info',
  enviado: 'secondary',
  entregado: 'success',
  cancelado: 'error',
};

export const PAYMENT_STATUS_COLOR = {
  pendiente: 'warning',
  pagado: 'success',
  rechazado: 'error',
  reembolsado: 'info',
};

const findLabel = (options, value) =>
  options.find((option) => option.value === value)?.label || value || '-';

export const getOrderStatusLabel = (status) =>
  findLabel(ORDER_STATUS_OPTIONS, status);

export const getPaymentStatusLabel = (status) =>
  findLabel(PAYMENT_STATUS_OPTIONS, status);

export const normalizeOrdersPaginatedResponse = (data, pageNumber, pageSize) => {
  const value = Array.isArray(data) ? data[0] : data;
  const items = value?.items ?? value?.data ?? value?.registros ?? [];
  const totalCount = value?.totalCount ?? value?.total_count ?? value?.total ?? items.length;
  const currentPage = value?.pageNumber ?? value?.page_number ?? value?.pagina_actual ?? pageNumber;
  const currentPageSize = value?.pageSize ?? value?.page_size ?? value?.tamano_pagina ?? pageSize;
  const totalPages = value?.totalPages ?? value?.total_pages ?? Math.max(Math.ceil(totalCount / currentPageSize), 1);

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
  historial_estados: detail.historial_estados || detail.pedido_historial_estados || [],
});

export const mapOrderStatusFormToPayload = (form) => ({
  pedidoId: form.pedidoId,
  estadoNuevo: form.estadoNuevo,
  comentario: form.comentario?.trim() || null,
});
