import { getDefaultAdminDateFilters } from '../../../../utils/defaultDateRange';

export const getInitialOrderFilters = () =>
  getDefaultAdminDateFilters({
    extraFilters: {
      estadoPedido: '',
      estadoPago: '',
    },
  });

export const initialFilters = getInitialOrderFilters();

export const getCleanFilters = () => getInitialOrderFilters();

export const initialStatusForm = {
  pedidoId: '',
  numeroPedido: '',
  estadoActual: '',
  estadoEnvioActual: '',
  estadoPago: '',
  avanceNuevo: '',
  transportistaId: '',
  empresaEnvio: '',
  numeroSeguimiento: '',
  urlSeguimiento: '',
  comentario: '',
};

export const initialCancelForm = {
  pedidoId: '',
  numeroPedido: '',
  motivo: '',
  comentario: '',
};

export const initialReopenForm = {
  pedidoId: '',
  numeroPedido: '',
  motivo: '',
  nuevaFechaLimitePago: '',
};

export const initialRefundForm = {
  pedidoId: '',
  numeroPedido: '',
  pagoId: '',
  monto: '',
  metodoReembolso: '',
  referenciaReembolso: '',
  motivo: '',
};
