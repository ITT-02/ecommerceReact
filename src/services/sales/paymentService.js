// Servicio para pagos y comprobantes.

import { restApi } from '../../api/restApi';

export const getPayments = async () => {
  const response = await restApi.get('/pagos', {
    params: {
      select: '*,pedidos(numero_pedido,total,estado_pedido,estado_pago)',
      order: 'created_at.desc',
    },
  });
  return response.data;
};

export const registerOrderPayment = async ({ pedidoId, metodoPago, monto, urlComprobante, referenciaTransaccion }) => {
  const response = await restApi.post('/rpc/registrar_pago_pedido', {
    p_pedido_id: pedidoId,
    p_metodo_pago: metodoPago,
    p_monto: monto,
    p_url_comprobante: urlComprobante || null,
    p_referencia_transaccion: referenciaTransaccion || null,
  });
  return response.data;
};

export const updatePaymentStatus = async (paymentId, estado) => {
  const payload = {
    estado,
    pagado_at: estado === 'aprobado' ? new Date().toISOString() : null,
  };

  const response = await restApi.patch('/pagos', payload, {
    params: { id: `eq.${paymentId}`, select: '*' },
    headers: { Prefer: 'return=representation' },
  });

  return response.data[0] || null;
};
