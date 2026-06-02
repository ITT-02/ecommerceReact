import { useMemo, useState } from 'react';
import { Chip, Typography, useMediaQuery, useTheme } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CurrencyExchangeRoundedIcon from '@mui/icons-material/CurrencyExchangeRounded';
import { useQuery } from '@tanstack/react-query';

import { ORDER_ATTENTION_GROUPS } from '../../../../components/admin/orders/OrdersAttentionSidebar';
import { useOrders } from '../../../../hooks/sales/useOrders';
import { getOrders, syncCommercialExpirations } from '../../../../services/sales/orderService';
import {
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_STATUS_COLOR,
  getShippingStatusLabel,
} from '../../../../adapters/orderAdapter';

import {
  getCleanFilters,
  initialCancelForm,
  initialRefundForm,
  initialReopenForm,
  initialStatusForm,
} from '../constants/ordersPageConstants';
import {
  formatDate,
  getAdvanceStatus,
  getTargetOrderStatus,
  isShippingAdvance,
  normalizeObject,
  requiresTransportData,
} from '../utils/ordersPageUtils';
import { blurActiveElement, runAfterBlur } from '../utils/dialogFocusUtils';
import {
  ORDER_ACTIONS,
  getOrderActionDisabledReason,
  isOrderActionDisabled,
} from '../utils/orderActionRules';
import { OrderStatusBadge } from '../components/OrderStatusBadge';

export const useOrdersPageController = () => {
  const theme = useTheme();
  const isMobileActions = useMediaQuery(theme.breakpoints.down('sm'));

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(getCleanFilters);
  const [pageNotice, setPageNotice] = useState('');
  const [activeAttentionKey, setActiveAttentionKey] = useState('');

  const [showAttentionPanel, setShowAttentionPanel] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [cancelForm, setCancelForm] = useState(initialCancelForm);
  const [reopenForm, setReopenForm] = useState(initialReopenForm);
  const [refundForm, setRefundForm] = useState(initialRefundForm);

  const {
    orders,
    pagination,
    loading,
    fetching,
    error,
    loadingAction,
    getOrderDetail,
    updateOrderStatus,
    cancelOrder,
    reopenOrder,
    registerRefund,
    registerShipmentTracking,
  } = useOrders({
    pageNumber,
    pageSize,
    search,
    estadoPedido: filters.estadoPedido || null,
    estadoPago: filters.estadoPago || null,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });

  const attentionSummaryQuery = useQuery({
    queryKey: ['orders-admin', 'attention-summary'],
    queryFn: async () => {
      await syncCommercialExpirations();

      const summaryEntries = await Promise.all(
        ORDER_ATTENTION_GROUPS.map(async (group) => {
          const response = await getOrders({
            pageNumber: 1,
            pageSize: 1,
            estadoPedido: group.filters?.estadoPedido || null,
            estadoPago: group.filters?.estadoPago || null,
          });

          return [group.key, Number(response?.totalCount ?? 0)];
        })
      );

      return Object.fromEntries(summaryEntries);
    },
    staleTime: 30_000,
  });

  const attentionSummaryTotals = useMemo(
    () => attentionSummaryQuery.data || {},
    [attentionSummaryQuery.data]
  );

  const clearListState = () => {
    setActiveAttentionKey('');
    setPageNotice('');
    setPageNumber(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    clearListState();
  };

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    clearListState();
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters(getCleanFilters());
    clearListState();
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPageNumber(1);
  };

  const handleApplyAttentionFilter = (group) => {
    if (!group?.filters) return;

    setSearch('');
    setFilters({ ...getCleanFilters(), ...group.filters });
    setActiveAttentionKey(group.key || '');
    setPageNotice('');
    setPageNumber(1);
  };

  const handleClearAttentionFilter = () => {
    setSearch('');
    setFilters(getCleanFilters());
    setActiveAttentionKey('');
    setPageNotice('');
    setPageNumber(1);
  };

  const loadOrderDetail = async (order) => {
    setFormError('');

    try {
      const detail = await getOrderDetail(order.id);
      setSelectedOrder(detail || order);
      return detail || order;
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
      return null;
    }
  };

  const handleCloseDetail = () => {
    runAfterBlur(() => setDetailOpen(false));
  };

  const handleClosePayments = () => {
    runAfterBlur(() => setPaymentsOpen(false));
  };

  const handleViewDetail = async (order) => {
    blurActiveElement();
    const detail = await loadOrderDetail(order);
    if (detail) setDetailOpen(true);
  };

  const handleViewPayments = async (order) => {
    blurActiveElement();
    const detail = await loadOrderDetail(order);
    if (detail) setPaymentsOpen(true);
  };

  const handleOpenStatus = (order) => {
    if (isOrderActionDisabled(ORDER_ACTIONS.ADVANCE, order)) return;

    blurActiveElement();
    setSelectedOrder(order);
    setStatusForm({
      pedidoId: order.id,
      numeroPedido: order.numero_pedido || '',
      estadoActual: order.estado_pedido || '',
      estadoEnvioActual: order.estado_envio || 'pendiente',
      estadoPago: order.estado_pago || '',
      avanceNuevo: '',
      transportistaId: order.transportista_id || '',
      empresaEnvio: order.empresa_envio || '',
      numeroSeguimiento: order.numero_seguimiento || '',
      urlSeguimiento: order.url_seguimiento || '',
      comentario: '',
    });
    setFormError('');
    setStatusOpen(true);
  };

  const handleOpenCancel = (order) => {
    if (isOrderActionDisabled(ORDER_ACTIONS.CANCEL, order)) return;

    blurActiveElement();
    setSelectedOrder(order);
    setCancelForm({
      pedidoId: order.id,
      numeroPedido: order.numero_pedido || '',
      motivo: '',
      comentario: '',
    });
    setFormError('');
    setCancelOpen(true);
  };

  const handleOpenReopen = (order) => {
    if (isOrderActionDisabled(ORDER_ACTIONS.REOPEN, order)) return;

    blurActiveElement();
    setSelectedOrder(order);
    setReopenForm({
      pedidoId: order.id,
      numeroPedido: order.numero_pedido || '',
      motivo: '',
      nuevaFechaLimitePago: '',
    });
    setFormError('');
    setReopenOpen(true);
  };

  const handleOpenRefund = async (order) => {
    if (isOrderActionDisabled(ORDER_ACTIONS.REFUND, order)) return;

    blurActiveElement();
    const detail = await loadOrderDetail(order);
    if (!detail) return;

    const approvedPayment = (detail.pagos || []).find(
      (payment) => payment.estado === 'aprobado'
    );

    setRefundForm({
      pedidoId: detail.id,
      numeroPedido: detail.numero_pedido || '',
      pagoId: approvedPayment?.id || '',
      monto: Number(detail.total || 0).toFixed(2),
      metodoReembolso: '',
      referenciaReembolso: '',
      motivo: '',
    });
    setFormError('');
    setRefundOpen(true);
  };

  const closeAllDialogs = () => {
    blurActiveElement();

    if (loadingAction) return;

    window.requestAnimationFrame(() => {
      setStatusOpen(false);
      setCancelOpen(false);
      setReopenOpen(false);
      setRefundOpen(false);
      setStatusForm(initialStatusForm);
      setCancelForm(initialCancelForm);
      setReopenForm(initialReopenForm);
      setRefundForm(initialRefundForm);
      setFormError('');
    });
  };

  const handleSubmitStatus = async (event) => {
    event.preventDefault();
    blurActiveElement();

    if (!statusForm.avanceNuevo) {
      setFormError('Selecciona el nuevo avance del pedido.');
      return;
    }

    if (requiresTransportData(statusForm.avanceNuevo) && !statusForm.transportistaId) {
      setFormError('Selecciona la empresa transportista.');
      return;
    }

    const targetOrderStatus = getTargetOrderStatus(statusForm.avanceNuevo);
    const targetShippingStatus = getAdvanceStatus(statusForm.avanceNuevo);

    try {
      if (targetOrderStatus && targetOrderStatus !== statusForm.estadoActual) {
        await updateOrderStatus({
          pedidoId: statusForm.pedidoId,
          numeroPedido: statusForm.numeroPedido,
          estadoActual: statusForm.estadoActual,
          estadoNuevo: targetOrderStatus,
          comentario: statusForm.comentario,
        });
      }

      if (isShippingAdvance(statusForm.avanceNuevo)) {
        await registerShipmentTracking({
          pedidoId: statusForm.pedidoId,
          numeroPedido: statusForm.numeroPedido,
          estadoEnvioActual: statusForm.estadoEnvioActual,
          estadoEnvio: targetShippingStatus,
          transportistaId: statusForm.transportistaId,
          empresaEnvio: statusForm.empresaEnvio,
          numeroSeguimiento: statusForm.numeroSeguimiento,
          urlSeguimiento: statusForm.urlSeguimiento,
          comentario: statusForm.comentario,
        });
      }

      setPageNotice(`Avance actualizado para el pedido ${statusForm.numeroPedido}.`);
      closeAllDialogs();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const handleSubmitCancel = async (event) => {
    event.preventDefault();
    blurActiveElement();

    if (!cancelForm.motivo.trim()) {
      setFormError('Ingresa el motivo de cancelación.');
      return;
    }

    try {
      await cancelOrder(cancelForm);
      setPageNotice(`Pedido ${cancelForm.numeroPedido} cancelado correctamente.`);
      closeAllDialogs();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const handleSubmitReopen = async (event) => {
    event.preventDefault();
    blurActiveElement();

    if (!reopenForm.motivo.trim()) {
      setFormError('Ingresa el motivo de reapertura.');
      return;
    }

    try {
      await reopenOrder(reopenForm);
      setPageNotice(`Pedido ${reopenForm.numeroPedido} reabierto correctamente.`);
      closeAllDialogs();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const handleSubmitRefund = async (event) => {
    event.preventDefault();
    blurActiveElement();

    if (!refundForm.metodoReembolso.trim() || !refundForm.motivo.trim()) {
      setFormError('Ingresa método y motivo del reembolso.');
      return;
    }

    try {
      await registerRefund(refundForm);
      setPageNotice(`Reembolso registrado para el pedido ${refundForm.numeroPedido}.`);
      closeAllDialogs();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const columns = useMemo(
    () => [
      {
        field: 'numero_pedido',
        headerName: 'N° Pedido',
        width: 155,
        renderCell: (row) => (
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {row.numero_pedido || 'Sin número'}
          </Typography>
        ),
      },
      { field: 'nombre_cliente', headerName: 'Cliente', width: 210, emptyText: 'Sin cliente' },
      { field: 'telefono_cliente', headerName: 'Teléfono', width: 145, emptyText: '-' },
      {
        field: 'estado_pedido',
        headerName: 'Estado pedido',
        width: 160,
        renderCell: (row) => <OrderStatusBadge value={row.estado_pedido} />,
      },
      {
        field: 'estado_pago',
        headerName: 'Estado pago',
        width: 170,
        renderCell: (row) => <OrderStatusBadge type="payment" value={row.estado_pago} />,
      },
      {
        field: 'estado_envio',
        headerName: 'Estado envío',
        width: 185,
        renderCell: (row) => (
          <Chip
            size="small"
            label={getShippingStatusLabel(row.estado_envio)}
            color={SHIPPING_STATUS_COLOR[row.estado_envio] || 'default'}
            variant="outlined"
          />
        ),
      },
      {
        field: 'fecha_limite_pago',
        headerName: 'Límite pago',
        width: 150,
        renderCell: (row) => formatDate(row.fecha_limite_pago),
      },
      { field: 'total_items', headerName: 'Items', width: 90, align: 'center' },
      { field: 'total', headerName: 'Total', width: 125, type: 'currency' },
      {
        field: 'puede_recibir_pago',
        headerName: 'Puede pagar',
        type: 'boolean',
        width: 130,
        trueLabel: 'Sí',
        falseLabel: 'No',
        falseColor: 'default',
      },
      {
        field: 'created_at',
        headerName: 'Fecha',
        width: 135,
        renderCell: (row) => formatDate(row.created_at),
      },
    ],
    []
  );

  const tableFilters = useMemo(
    () => [
      { name: 'estadoPedido', label: 'Estado pedido', type: 'select', width: 190, options: ORDER_STATUS_OPTIONS },
      { name: 'estadoPago', label: 'Estado pago', type: 'select', width: 190, options: PAYMENT_STATUS_OPTIONS },
      { name: 'fechaInicio', label: 'Desde', type: 'date', width: 155, maxDate: filters.fechaFin || undefined },
      { name: 'fechaFin', label: 'Hasta', type: 'date', width: 155, minDate: filters.fechaInicio || undefined },
    ],
    [filters.fechaInicio, filters.fechaFin]
  );

  const getActionVisible = (actionKey) => (order) => {
    if (!isMobileActions) return true;

    return !isOrderActionDisabled(actionKey, order);
  };

  const getActionDisabled = (actionKey) => (order) => {
    return isOrderActionDisabled(actionKey, order);
  };

  const getActionDisabledReason = (actionKey) => (order) => {
    if (isMobileActions) return '';

    return getOrderActionDisabledReason(actionKey, order);
  };

  const actions = [
    {
      type: 'view',
      label: 'Ver detalle',
      onClick: handleViewDetail,
    },
    {
      type: 'edit',
      label: 'Actualizar avance',
      visible: getActionVisible(ORDER_ACTIONS.ADVANCE),
      disabled: getActionDisabled(ORDER_ACTIONS.ADVANCE),
      disabledReason: getActionDisabledReason(ORDER_ACTIONS.ADVANCE),
      onClick: handleOpenStatus,
    },
    {
      type: 'payments',
      label: 'Ver pagos',
      icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: handleViewPayments,
    },
    {
      type: 'cancel',
      label: 'Cancelar pedido',
      visible: getActionVisible(ORDER_ACTIONS.CANCEL),
      disabled: getActionDisabled(ORDER_ACTIONS.CANCEL),
      disabledReason: getActionDisabledReason(ORDER_ACTIONS.CANCEL),
      onClick: handleOpenCancel,
    },
    {
      type: 'add',
      label: 'Reabrir pedido',
      visible: getActionVisible(ORDER_ACTIONS.REOPEN),
      disabled: getActionDisabled(ORDER_ACTIONS.REOPEN),
      disabledReason: getActionDisabledReason(ORDER_ACTIONS.REOPEN),
      onClick: handleOpenReopen,
    },
    {
      type: 'refund',
      label: 'Registrar reembolso',
      icon: <CurrencyExchangeRoundedIcon sx={{ fontSize: 17 }} />,
      visible: getActionVisible(ORDER_ACTIONS.REFUND),
      disabled: getActionDisabled(ORDER_ACTIONS.REFUND),
      disabledReason: getActionDisabledReason(ORDER_ACTIONS.REFUND),
      onClick: handleOpenRefund,
    },
  ];

  const order = selectedOrder || {};
  const deliveryData = normalizeObject(order.datos_entrega || order.direccion_entrega);

  return {
    errorMessage: error || formError,
    pageNotice,
    onClearNotice: () => setPageNotice(''),

    tableSectionProps: {
      showAttentionPanel,
      setShowAttentionPanel,
      activeAttentionKey,
      attentionSummaryTotals,
      attentionLoading: attentionSummaryQuery.isLoading || attentionSummaryQuery.isFetching,
      onApplyAttentionFilter: handleApplyAttentionFilter,
      onClearAttentionFilter: handleClearAttentionFilter,
      rows: orders,
      columns,
      actions,
      loading: loading || fetching,
      pagination,
      search,
      filters,
      tableFilters,
      onSearchChange: handleSearchChange,
      onFilterChange: handleFilterChange,
      onResetFilters: handleResetFilters,
      onPageChange: setPageNumber,
      onPageSizeChange: handlePageSizeChange,
    },

    detailDialogProps: {
      open: detailOpen,
      order,
      deliveryData,
      onClose: handleCloseDetail,
    },

    paymentsDialogProps: {
      open: paymentsOpen,
      order,
      onClose: handleClosePayments,
    },

    advanceDialogProps: {
      open: statusOpen,
      order: selectedOrder,
      form: statusForm,
      error: formError,
      loading: loadingAction,
      onChange: (name, value) => setStatusForm((current) => ({ ...current, [name]: value })),
      onClose: closeAllDialogs,
      onSubmit: handleSubmitStatus,
    },

    cancelDialogProps: {
      open: cancelOpen,
      form: cancelForm,
      error: formError,
      loading: loadingAction,
      onChange: setCancelForm,
      onClose: closeAllDialogs,
      onSubmit: handleSubmitCancel,
    },

    reopenDialogProps: {
      open: reopenOpen,
      form: reopenForm,
      error: formError,
      loading: loadingAction,
      onChange: setReopenForm,
      onClose: closeAllDialogs,
      onSubmit: handleSubmitReopen,
    },

    refundDialogProps: {
      open: refundOpen,
      form: refundForm,
      error: formError,
      loading: loadingAction,
      onChange: setRefundForm,
      onClose: closeAllDialogs,
      onSubmit: handleSubmitRefund,
    },
  };
};