// Estados de pedido definidos en la base de datos.

export const ORDER_STATUS = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  pagado: 'Pagado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_FLOW = [
  'pendiente',
  'confirmado',
  'pagado',
  'preparando',
  'enviado',
  'entregado',
];
