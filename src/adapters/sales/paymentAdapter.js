// Adapta datos de pago a payload de comprobante.

export const paymentFormToPayload = (formData) => ({
  p_pedido_id: formData.pedido_id,
  p_metodo_pago: formData.metodo_pago,
  p_monto: Number(formData.monto || 0),
  p_url_comprobante: formData.url_comprobante || null,
  p_referencia_transaccion: formData.referencia_transaccion || null,
});
