// Página administrativa: Pedidos.
// Separa estado operativo, pagos, cancelaciones, reaperturas y reembolsos.

import { isValidElement, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded';
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded';
import { useQuery } from '@tanstack/react-query';

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { OrderAdvanceDialog } from '../../../components/admin/orders/OrderAdvanceDialog';
import {
  ORDER_ATTENTION_GROUPS,
  OrdersAttentionSidebar,
} from '../../../components/admin/orders/OrdersAttentionSidebar';
import { TrackingCard } from '../../../components/orders/TrackingCard';
import { useOrders } from '../../../hooks/sales/useOrders';
import { getOrders, syncCommercialExpirations } from '../../../services/sales/orderService';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_OPTIONS,
  SHIPPING_REQUIRED_ADVANCE_VALUES,
  SHIPPING_STATUS_COLOR,
  getOrderStatusLabel,
  getPaymentStatusLabel,
  getShippingStatusLabel,
} from '../../../adapters/orderAdapter';

const initialFilters = {
  estadoPedido: '',
  estadoPago: '',
  fechaInicio: '',
  fechaFin: '',
};

const getCleanFilters = () => ({ ...initialFilters });

const initialStatusForm = {
  pedidoId: '',
  numeroPedido: '',
  estadoActual: '',
  estadoEnvioActual: '',
  estadoPago: '',
  avanceNuevo: '',
  empresaEnvio: '',
  numeroSeguimiento: '',
  urlSeguimiento: '',
  comentario: '',
};

const initialCancelForm = {
  pedidoId: '',
  numeroPedido: '',
  motivo: '',
  comentario: '',
};

const initialReopenForm = {
  pedidoId: '',
  numeroPedido: '',
  motivo: '',
  nuevaFechaLimitePago: '',
};

const initialRefundForm = {
  pedidoId: '',
  numeroPedido: '',
  pagoId: '',
  monto: '',
  metodoReembolso: '',
  referenciaReembolso: '',
  motivo: '',
};

const initialTrackingForm = {
  pedidoId: '',
  numeroPedido: '',
  estadoEnvioActual: '',
  estadoEnvio: 'entregado_repartidora',
  empresaEnvio: '',
  numeroSeguimiento: '',
  urlSeguimiento: '',
  comentario: '',
};

const formatDate = (value) => {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 16);
};

const formatDateInput = (value) => {
  if (!value) return '';
  return String(value).slice(0, 16);
};

const formatCurrency = (value) => `S/ ${Number(value ?? 0).toFixed(2)}`;

const isImageUrl = (url = '') => /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url.split('?')[0]);

const normalizeObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};


const getAdvanceType = (value = '') => value.split(':')[0] || '';
const getAdvanceStatus = (value = '') => value.split(':')[1] || '';
const isShippingAdvance = (value = '') => getAdvanceType(value) === 'envio';
const getTargetOrderStatus = (avanceNuevo = '') => {
  const advanceStatus = getAdvanceStatus(avanceNuevo);

  if (!isShippingAdvance(avanceNuevo)) return advanceStatus;
  if (advanceStatus === 'entregado') return 'entregado';
  return 'enviado';
};

const requiresTransportData = (avanceNuevo = '') =>
  isShippingAdvance(avanceNuevo) && SHIPPING_REQUIRED_ADVANCE_VALUES.includes(getAdvanceStatus(avanceNuevo));


const StatusBadge = ({ type = 'order', value }) => {
  const colorMap = type === 'payment' ? PAYMENT_STATUS_COLOR : ORDER_STATUS_COLOR;
  const label = type === 'payment' ? getPaymentStatusLabel(value) : getOrderStatusLabel(value);

  return (
    <Chip size="small" label={label} color={colorMap[value] || 'default'} variant="outlined" />
  );
};

const InfoLine = ({ label, value }) => (
  <Stack spacing={0.25}>
    <Typography variant="caption" color="text.secondary" fontWeight={700}>
      {label}
    </Typography>
    {isValidElement(value) ? (
      <Box>{value}</Box>
    ) : (
      <Typography variant="body2">{value ?? '-'}</Typography>
    )}
  </Stack>
);

const Section = ({ title, children }) => (
  <Stack spacing={1.5}>
    <Typography variant="subtitle1" fontWeight={800}>
      {title}
    </Typography>
    {children}
  </Stack>
);

export const OrdersPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [pageNotice, setPageNotice] = useState('');
  const [activeAttentionKey, setActiveAttentionKey] = useState('');
  const [showAttentionPanel, setShowAttentionPanel] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reopenOpen, setReopenOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [cancelForm, setCancelForm] = useState(initialCancelForm);
  const [reopenForm, setReopenForm] = useState(initialReopenForm);
  const [refundForm, setRefundForm] = useState(initialRefundForm);
  const [trackingForm, setTrackingForm] = useState(initialTrackingForm);

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

  const handleSearchChange = (value) => {
    setSearch(value);
    setActiveAttentionKey('');
    setPageNotice('');
    setPageNumber(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setActiveAttentionKey('');
    setPageNotice('');
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters(getCleanFilters());
    setActiveAttentionKey('');
    setPageNotice('');
    setPageNumber(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPageNumber(1);
  };


  const handleApplyAttentionFilter = (group) => {
    if (!group?.filters) return;

    // Cada acceso rápido reemplaza todos los filtros activos para evitar que
    // queden combinados estados anteriores con el nuevo filtro seleccionado.
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

  const handleViewDetail = async (order) => {
    const detail = await loadOrderDetail(order);
    if (detail) setDetailOpen(true);
  };

  const handleViewPayments = async (order) => {
    const detail = await loadOrderDetail(order);
    if (detail) setPaymentsOpen(true);
  };

  const handleOpenStatus = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      pedidoId: order.id,
      numeroPedido: order.numero_pedido || '',
      estadoActual: order.estado_pedido || '',
      estadoEnvioActual: order.estado_envio || 'pendiente',
      estadoPago: order.estado_pago || '',
      avanceNuevo: '',
      empresaEnvio: order.empresa_envio || '',
      numeroSeguimiento: order.numero_seguimiento || '',
      urlSeguimiento: order.url_seguimiento || '',
      comentario: '',
    });
    setFormError('');
    setStatusOpen(true);
  };

  const handleOpenCancel = (order) => {
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
    const detail = await loadOrderDetail(order);
    if (!detail) return;

    const approvedPayment = (detail.pagos || []).find((payment) => payment.estado === 'aprobado');

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

  const handleOpenTracking = (order) => {
    setSelectedOrder(order);
    setTrackingForm({
      pedidoId: order.id,
      numeroPedido: order.numero_pedido || '',
      estadoEnvioActual: order.estado_envio || 'pendiente',
      estadoEnvio: order.estado_envio && order.estado_envio !== 'pendiente' ? order.estado_envio : 'entregado_repartidora',
      empresaEnvio: order.empresa_envio || '',
      numeroSeguimiento: order.numero_seguimiento || '',
      urlSeguimiento: order.url_seguimiento || '',
      comentario: '',
    });
    setFormError('');
    setTrackingOpen(true);
  };

  const handleTrackingFormChange = (name, value) => {
    setTrackingForm((current) => ({ ...current, [name]: value }));
  };

  const closeAllDialogs = () => {
    if (loadingAction) return;
    setStatusOpen(false);
    setCancelOpen(false);
    setReopenOpen(false);
    setRefundOpen(false);
    setTrackingOpen(false);
    setStatusForm(initialStatusForm);
    setCancelForm(initialCancelForm);
    setReopenForm(initialReopenForm);
    setRefundForm(initialRefundForm);
    setTrackingForm(initialTrackingForm);
    setFormError('');
  };

  const handleSubmitStatus = async (event) => {
    event.preventDefault();

    if (!statusForm.avanceNuevo) {
      setFormError('Selecciona el nuevo avance del pedido.');
      return;
    }

    if (requiresTransportData(statusForm.avanceNuevo) && !statusForm.empresaEnvio.trim()) {
      setFormError('Ingresa la empresa transportista.');
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

  const handleSubmitTracking = async (event) => {
    event.preventDefault();

    if (!trackingForm.estadoEnvio) {
      setFormError('Selecciona el estado de envío.');
      return;
    }

    if (
      ['entregado_repartidora', 'en_transito', 'en_destino', 'entregado'].includes(trackingForm.estadoEnvio) &&
      !trackingForm.empresaEnvio.trim()
    ) {
      setFormError('Ingresa la empresa transportista para informar al cliente quién trae su paquete.');
      return;
    }

    try {
      await registerShipmentTracking(trackingForm);
      setPageNotice(`Seguimiento actualizado para el pedido ${trackingForm.numeroPedido}.`);
      closeAllDialogs();
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
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
      renderCell: (row) => <StatusBadge value={row.estado_pedido} />,
    },
    {
      field: 'estado_pago',
      headerName: 'Estado pago',
      width: 170,
      renderCell: (row) => <StatusBadge type="payment" value={row.estado_pago} />,
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
  ];

  const tableFilters = [
    { name: 'estadoPedido', label: 'Estado pedido', type: 'select', width: 190, options: ORDER_STATUS_OPTIONS },
    { name: 'estadoPago', label: 'Estado pago', type: 'select', width: 190, options: PAYMENT_STATUS_OPTIONS },
    { name: 'fechaInicio', label: 'Desde', type: 'date', width: 155, maxDate: filters.fechaFin || undefined },
    { name: 'fechaFin', label: 'Hasta', type: 'date', width: 155, minDate: filters.fechaInicio || undefined },
  ];

  const actions = [
    { type: 'view', label: 'Ver detalle', onClick: handleViewDetail },
    {
      type: 'edit',
      label: 'Actualizar avance',
      visible: (order) => order.estado_pedido !== 'cancelado',
      onClick: handleOpenStatus,
    },
    { type: 'receipt', label: 'Ver pagos', onClick: handleViewPayments },
    {
      type: 'cancel',
      label: 'Cancelar pedido',
      visible: (order) => order.estado_pedido !== 'cancelado',
      onClick: handleOpenCancel,
    },
    {
      type: 'add',
      label: 'Reabrir pedido',
      visible: (order) => order.estado_pedido === 'cancelado' && order.estado_pago !== 'reembolsado',
      onClick: handleOpenReopen,
    },
    {
      type: 'receipt',
      label: 'Registrar reembolso',
      visible: (order) => order.estado_pago === 'reembolso_pendiente',
      onClick: handleOpenRefund,
    },
  ];

  const order = selectedOrder || {};
  const deliveryData = normalizeObject(order.datos_entrega || order.direccion_entrega);

  return (
    <PlaceholderPage
      title="Pedidos"
      description="Atiende pedidos por prioridad, actualiza preparación, despacho y seguimiento desde un solo flujo."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />

        {pageNotice && (
          <Alert severity="success" onClose={() => setPageNotice('')}>
            {pageNotice}
          </Alert>
        )}

        <Stack spacing={1.5}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <Tooltip title={showAttentionPanel ? 'Ocultar atención rápida' : 'Abrir atención rápida'}>
              <IconButton
                color={showAttentionPanel ? 'primary' : 'default'}
                onClick={() => setShowAttentionPanel((current) => !current)}
                aria-label={showAttentionPanel ? 'Ocultar atención rápida' : 'Abrir atención rápida'}
                sx={{
                  border: 1,
                  borderColor: showAttentionPanel ? 'primary.main' : 'divider',
                  bgcolor: showAttentionPanel ? 'action.selected' : 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                {showAttentionPanel ? (
                  <KeyboardDoubleArrowLeftRoundedIcon fontSize="small" />
                ) : (
                  <KeyboardDoubleArrowRightRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: showAttentionPanel ? 'minmax(260px, 320px) minmax(0, 1fr)' : '1fr',
              },
              gap: 2,
              alignItems: 'flex-start',
            }}
          >
            {showAttentionPanel && (
              <OrdersAttentionSidebar
                activeKey={activeAttentionKey}
                summaryTotals={attentionSummaryTotals}
                loading={attentionSummaryQuery.isLoading || attentionSummaryQuery.isFetching}
                onApplyFilter={handleApplyAttentionFilter}
                onClearFilter={handleClearAttentionFilter}
              />
            )}

            <Box sx={{ minWidth: 0 }}>
            <AdminResourceTable
              rows={orders}
              columns={columns}
              actions={actions}
              loading={loading || fetching}
              pagination={pagination}
              searchValue={search}
              searchLabel="Buscar pedido"
              filters={tableFilters}
              filterValues={filters}
              onSearchChange={handleSearchChange}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onPageChange={setPageNumber}
              onPageSizeChange={handlePageSizeChange}
              emptyTitle="No hay pedidos"
              emptyDescription="Intenta ajustar la búsqueda o cambiar los filtros."
              maxHeight={620}
            />
            </Box>
          </Box>
        </Stack>
      </Stack>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle sx={{ pr: 6 }}>
          Detalle del pedido {order.numero_pedido}
          <IconButton
            onClick={() => setDetailOpen(false)}
            size="small"
            aria-label="Cerrar detalle"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {order.estado_pago === 'vencido' && (
              <Alert severity="error">El pedido venció por falta de pago. El cliente ya no puede subir comprobante.</Alert>
            )}
            {order.estado_pago === 'reembolso_pendiente' && (
              <Alert severity="warning">Pedido cancelado con pago aprobado. Registra el reembolso para cerrar el flujo.</Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Section title="Pedido">
                  <InfoLine label="N° pedido" value={order.numero_pedido} />
                  <InfoLine label="Estado pedido" value={<StatusBadge value={order.estado_pedido} />} />
                  <InfoLine label="Estado pago" value={<StatusBadge type="payment" value={order.estado_pago} />} />
                  <InfoLine label="Método pago" value={order.metodo_pago} />
                  <InfoLine label="Fecha límite pago" value={formatDate(order.fecha_limite_pago)} />
                  <InfoLine label="Origen" value={order.canal_venta === 'manual' ? 'Venta manual' : 'Tienda'} />
                  {order.canal_venta === 'manual' && (
                    <InfoLine label="Vendedor" value={order.vendedor_nombre || (order.vendedor_responsable_id ? 'Usuario interno' : '-')} />
                  )}
                  <InfoLine label="Fecha" value={formatDate(order.created_at)} />
                </Section>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Section title="Cliente">
                  <InfoLine label="Nombre" value={order.nombre_cliente} />
                  <InfoLine label="Teléfono" value={order.telefono_cliente} />
                  <InfoLine label="Correo" value={order.correo_cliente} />
                </Section>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Section title="Entrega">
                  <InfoLine label="Tipo" value={order.tipo_entrega || deliveryData.tipo_entrega || 'recojo'} />
                  <InfoLine label="Receptor" value={deliveryData.nombre_receptor || deliveryData.destinatario} />
                  <InfoLine label="Teléfono" value={deliveryData.telefono_receptor || deliveryData.telefono} />
                  <InfoLine label="Dirección" value={deliveryData.direccion || deliveryData.direccion_linea} />
                  <InfoLine label="Distrito" value={deliveryData.distrito} />
                  <InfoLine label="Referencia" value={deliveryData.referencia} />
                </Section>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Section title="Totales">
                  <InfoLine label="Subtotal" value={formatCurrency(order.subtotal)} />
                  <InfoLine label="Descuento" value={formatCurrency(order.descuento_total)} />
                  <InfoLine label="Envío" value={formatCurrency(order.costo_envio)} />
                  <InfoLine label="Total" value={formatCurrency(order.total)} />
                  <InfoLine label="Reembolsado" value={formatCurrency(order.total_reembolsado)} />
                </Section>
              </Grid>
            </Grid>

            <TrackingCard order={order} title="Seguimiento logístico" />

            {order.cancelacion_motivo && (
              <Alert severity="warning">Motivo de cancelación: {order.cancelacion_motivo}</Alert>
            )}

            <Divider />

            <Section title="Items">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Variante</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(order.items || []).map((item) => (
                    <TableRow key={item.id || `${item.nombre_producto}-${item.nombre_variante}`}>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="body2" fontWeight={800}>{item.nombre_producto || '-'}</Typography>
                          {Array.isArray(item.personalizaciones) && item.personalizaciones.length > 0 && (
                            <Alert severity="warning" sx={{ py: 0.5 }}>
                              <Typography variant="caption" fontWeight={900}>Personalización solicitada</Typography>
                              {item.personalizaciones.map((custom) => (
                                <Typography key={custom.id || custom.opcion_codigo} variant="caption" sx={{ display: 'block', wordBreak: 'break-word' }}>
                                  {custom.opcion_nombre || custom.opcion_codigo}: {custom.valor_texto || custom.observacion || 'Archivo adjunto'}
                                  {custom.archivo_url && (
                                    <> · <Link href={custom.archivo_url} target="_blank" rel="noreferrer">Ver archivo</Link></>
                                  )}
                                </Typography>
                              ))}
                            </Alert>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>{item.nombre_variante || '-'}</TableCell>
                      <TableCell align="right">{item.cantidad ?? 0}</TableCell>
                      <TableCell align="right">{formatCurrency(item.precio_unitario)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.total_linea)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Divider />

            <Section title="Historial">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Anterior</TableCell>
                    <TableCell>Nuevo</TableCell>
                    <TableCell>Comentario</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(order.historial_estados || []).map((history) => (
                    <TableRow key={history.id || `${history.estado_nuevo}-${history.created_at}`}>
                      <TableCell>{getOrderStatusLabel(history.estado_anterior)}</TableCell>
                      <TableCell>{getOrderStatusLabel(history.estado_nuevo)}</TableCell>
                      <TableCell>{history.comentario || '-'}</TableCell>
                      <TableCell>{formatDate(history.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentsOpen} onClose={() => setPaymentsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6 }}>
          Pagos del pedido {order.numero_pedido}
          <IconButton
            onClick={() => setPaymentsOpen(false)}
            size="small"
            aria-label="Cerrar pagos"
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {(order.pagos || []).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Este pedido no tiene comprobantes registrados.
              </Typography>
            )}

            {(order.pagos || []).map((payment) => (
              <Card key={payment.id || payment.created_at} variant="outlined">
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InfoLine label="Fecha" value={formatDate(payment.created_at)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InfoLine label="Método" value={payment.metodo_pago} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InfoLine label="Monto" value={formatCurrency(payment.monto)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <InfoLine label="Estado" value={<Chip size="small" label={payment.estado} variant="outlined" />} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      {payment.url_comprobante ? (
                        isImageUrl(payment.url_comprobante) ? (
                          <Box
                            component="img"
                            src={payment.url_comprobante}
                            alt="Comprobante"
                            sx={{
                              width: '100%',
                              maxHeight: 260,
                              objectFit: 'contain',
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          />
                        ) : (
                          <Link href={payment.url_comprobante} target="_blank" rel="noreferrer">
                            Abrir comprobante
                          </Link>
                        )
                      ) : (
                        <Typography variant="body2" color="text.secondary">Sin comprobante</Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}

            {(order.reembolsos || []).length > 0 && (
              <>
                <Divider />
                <Typography variant="h6">Reembolsos registrados</Typography>
                {(order.reembolsos || []).map((refund) => (
                  <Card key={refund.id} variant="outlined">
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 3 }}><InfoLine label="Monto" value={formatCurrency(refund.monto)} /></Grid>
                        <Grid size={{ xs: 12, md: 3 }}><InfoLine label="Método" value={refund.metodo_reembolso} /></Grid>
                        <Grid size={{ xs: 12, md: 3 }}><InfoLine label="Referencia" value={refund.referencia_reembolso} /></Grid>
                        <Grid size={{ xs: 12, md: 3 }}><InfoLine label="Fecha" value={formatDate(refund.created_at)} /></Grid>
                        <Grid size={{ xs: 12 }}><InfoLine label="Motivo" value={refund.motivo} /></Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      <OrderAdvanceDialog
        open={statusOpen}
        order={selectedOrder}
        form={statusForm}
        error={formError}
        loading={loadingAction}
        onChange={(name, value) => setStatusForm((current) => ({ ...current, [name]: value }))}
        onClose={closeAllDialogs}
        onSubmit={handleSubmitStatus}
      />

      <Dialog open={cancelOpen} onClose={closeAllDialogs} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmitCancel}>
          <DialogTitle>Cancelar pedido</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <ErrorMessage message={formError} />
              <Alert severity="warning">
                Si el pedido está pagado, no se elimina el pago: quedará como reembolso pendiente.
              </Alert>
              <TextField label="N° pedido" value={cancelForm.numeroPedido} disabled />
              <TextField
                required
                multiline
                minRows={3}
                label="Motivo de cancelación"
                value={cancelForm.motivo}
                onChange={(event) => setCancelForm((current) => ({ ...current, motivo: event.target.value }))}
              />
              <TextField
                multiline
                minRows={2}
                label="Comentario interno opcional"
                value={cancelForm.comentario}
                onChange={(event) => setCancelForm((current) => ({ ...current, comentario: event.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={closeAllDialogs} disabled={loadingAction}>Volver</Button>
            <Button type="submit" variant="contained" color="warning" disabled={loadingAction || !cancelForm.motivo.trim()}>
              Cancelar pedido
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={reopenOpen} onClose={closeAllDialogs} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmitReopen}>
          <DialogTitle>Reabrir pedido</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <ErrorMessage message={formError} />
              <Alert severity="info">
                Si el pedido no estaba pagado, puedes asignar una nueva fecha límite de pago. Si estaba pagado y no fue reembolsado, volverá como confirmado.
              </Alert>
              <TextField label="N° pedido" value={reopenForm.numeroPedido} disabled />
              <TextField
                required
                multiline
                minRows={3}
                label="Motivo de reapertura"
                value={reopenForm.motivo}
                onChange={(event) => setReopenForm((current) => ({ ...current, motivo: event.target.value }))}
              />
              <TextField
                label="Nueva fecha límite de pago"
                type="datetime-local"
                value={formatDateInput(reopenForm.nuevaFechaLimitePago)}
                onChange={(event) => setReopenForm((current) => ({ ...current, nuevaFechaLimitePago: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Aplica al volver a pendiente de pago."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={closeAllDialogs} disabled={loadingAction}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loadingAction || !reopenForm.motivo.trim()}>
              Reabrir pedido
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={refundOpen} onClose={closeAllDialogs} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmitRefund}>
          <DialogTitle>Registrar reembolso</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <ErrorMessage message={formError} />
              <TextField label="N° pedido" value={refundForm.numeroPedido} disabled />
              <TextField
                required
                label="Monto"
                type="number"
                value={refundForm.monto}
                onChange={(event) => setRefundForm((current) => ({ ...current, monto: event.target.value }))}
                slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
              />
              <TextField
                required
                label="Método de reembolso"
                value={refundForm.metodoReembolso}
                onChange={(event) => setRefundForm((current) => ({ ...current, metodoReembolso: event.target.value }))}
                helperText="Método usado para registrar el pago."
              />
              <TextField
                label="Referencia / operación"
                value={refundForm.referenciaReembolso}
                onChange={(event) => setRefundForm((current) => ({ ...current, referenciaReembolso: event.target.value }))}
              />
              <TextField
                required
                multiline
                minRows={3}
                label="Motivo"
                value={refundForm.motivo}
                onChange={(event) => setRefundForm((current) => ({ ...current, motivo: event.target.value }))}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={closeAllDialogs} disabled={loadingAction}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={loadingAction || !refundForm.metodoReembolso.trim() || !refundForm.motivo.trim()}>
              Registrar reembolso
            </Button>
          </DialogActions>
        </Box>

      </Dialog>

    </PlaceholderPage>
  );
};
