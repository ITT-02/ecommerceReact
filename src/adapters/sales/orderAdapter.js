// Adapta datos de checkout a payload de pedido.

export const checkoutFormToOrderPayload = (formData) => ({
  p_direccion_id: formData.direccion_id || null,
  p_metodo_pago: formData.metodo_pago || null,
  p_notas_cliente: formData.notas_cliente?.trim() || null,
});
