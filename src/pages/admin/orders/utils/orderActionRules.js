export const ORDER_ACTIONS = {
  ADVANCE: 'advance',
  CANCEL: 'cancel',
  REOPEN: 'reopen',
  REFUND: 'refund',
};

export const isOrderActionDisabled = (action, order = {}) => {
  if (action === ORDER_ACTIONS.ADVANCE) {
    return order.estado_pedido === 'cancelado';
  }

  if (action === ORDER_ACTIONS.CANCEL) {
    return order.estado_pedido === 'cancelado';
  }

  if (action === ORDER_ACTIONS.REOPEN) {
    return order.estado_pedido !== 'cancelado' || order.estado_pago === 'reembolsado';
  }

  if (action === ORDER_ACTIONS.REFUND) {
    return order.estado_pago !== 'reembolso_pendiente';
  }

  return false;
};

export const getOrderActionDisabledReason = (action, order = {}) => {
  if (action === ORDER_ACTIONS.ADVANCE) {
    if (order.estado_pedido === 'cancelado') {
      return 'No se puede actualizar el avance porque el pedido está cancelado.';
    }

    return 'El avance de este pedido no está disponible.';
  }

  if (action === ORDER_ACTIONS.CANCEL) {
    if (order.estado_pedido === 'cancelado') {
      return 'Este pedido ya está cancelado.';
    }

    return 'Este pedido no se puede cancelar.';
  }

  if (action === ORDER_ACTIONS.REOPEN) {
    if (order.estado_pedido !== 'cancelado') {
      return 'Solo se pueden reabrir pedidos cancelados.';
    }

    if (order.estado_pago === 'reembolsado') {
      return 'No se puede reabrir porque el pedido ya fue reembolsado.';
    }

    return 'Este pedido no se puede reabrir.';
  }

  if (action === ORDER_ACTIONS.REFUND) {
    if (order.estado_pago === 'reembolsado') {
      return 'Este pedido ya fue reembolsado.';
    }

    return 'El reembolso solo está disponible cuando el pago está en estado reembolso pendiente.';
  }

  return 'Acción no disponible.';
};
