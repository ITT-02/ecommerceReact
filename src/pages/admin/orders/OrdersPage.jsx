// Pagina administrativa: Pedidos.

import { isValidElement, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useOrders } from '../../../hooks/sales/useOrders';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_OPTIONS,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from '../../../adapters/orderAdapter';

const initialFilters = {
  estadoPedido: '',
  estadoPago: '',
  fechaInicio: '',
  fechaFin: '',
};

const initialStatusForm = {
  pedidoId: '',
  numeroPedido: '',
  estadoActual: '',
  estadoNuevo: '',
  comentario: '',
};

const formatDate = (value) => {
  if (!value) return '-';
  return String(value).split('T')[0];
};

const formatCurrency = (value) => `S/ ${Number(value ?? 0).toFixed(2)}`;

const isImageUrl = (url = '') =>
  /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(url.split('?')[0]);

const StatusBadge = ({ type = 'order', value }) => {
  const colorMap = type === 'payment' ? PAYMENT_STATUS_COLOR : ORDER_STATUS_COLOR;
  const label = type === 'payment' ? getPaymentStatusLabel(value) : getOrderStatusLabel(value);

  return (
    <Chip
      size="small"
      label={label}
      color={colorMap[value] || 'default'}
      variant="outlined"
    />
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusForm, setStatusForm] = useState(initialStatusForm);

  const {
    orders,
    pagination,
    loading,
    fetching,
    error,
    changingStatus,
    getOrderDetail,
    updateOrderStatus,
  } = useOrders({
    pageNumber,
    pageSize,
    search,
    estadoPedido: filters.estadoPedido || null,
    estadoPago: filters.estadoPago || null,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    setPageNotice('');
    setPageNumber(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPageNotice('');
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters(initialFilters);
    setPageNotice('');
    setPageNumber(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
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
      estadoNuevo: '',
      comentario: '',
    });
    setFormError('');
    setStatusOpen(true);
  };

  const handleCloseStatus = () => {
    if (changingStatus) return;
    setStatusOpen(false);
    setStatusForm(initialStatusForm);
    setFormError('');
  };

  const handleSubmitStatus = async (event) => {
    event.preventDefault();

    if (!statusForm.estadoNuevo || statusForm.estadoNuevo === statusForm.estadoActual) {
      setFormError('Selecciona un estado diferente al actual.');
      return;
    }

    try {
      await updateOrderStatus(statusForm);
      setStatusOpen(false);
      setPageNotice(`Estado actualizado para el pedido ${statusForm.numeroPedido}.`);
      setStatusForm(initialStatusForm);
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      field: 'numero_pedido',
      headerName: 'N. Pedido',
      width: 150,
      emptyText: 'Sin numero',
    },
    {
      field: 'nombre_cliente',
      headerName: 'Cliente',
      width: 210,
      emptyText: 'Sin cliente',
    },
    {
      field: 'telefono_cliente',
      headerName: 'Telefono',
      width: 150,
      emptyText: 'Sin telefono',
    },
    {
      field: 'estado_pedido',
      headerName: 'Estado pedido',
      width: 155,
      renderCell: (row) => <StatusBadge value={row.estado_pedido} />,
    },
    {
      field: 'estado_pago',
      headerName: 'Estado pago',
      width: 145,
      renderCell: (row) => <StatusBadge type="payment" value={row.estado_pago} />,
    },
    {
      field: 'metodo_pago',
      headerName: 'Metodo pago',
      width: 150,
      emptyText: '-',
    },
    {
      field: 'total_items',
      headerName: 'Items',
      width: 90,
      align: 'center',
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 125,
      type: 'currency',
    },
    {
      field: 'inventario_reservado',
      headerName: 'Reservado',
      type: 'boolean',
      width: 125,
      trueLabel: 'Si',
      falseLabel: 'No',
      falseColor: 'default',
    },
    {
      field: 'inventario_descontado',
      headerName: 'Descontado',
      type: 'boolean',
      width: 130,
      trueLabel: 'Si',
      falseLabel: 'No',
      falseColor: 'default',
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 125,
      renderCell: (row) => formatDate(row.created_at),
    },
  ];

  const tableFilters = [
    {
      name: 'estadoPedido',
      label: 'Estado pedido',
      type: 'select',
      width: 180,
      options: ORDER_STATUS_OPTIONS,
    },
    {
      name: 'estadoPago',
      label: 'Estado pago',
      type: 'select',
      width: 165,
      options: PAYMENT_STATUS_OPTIONS,
    },
    {
      name: 'fechaInicio',
      label: 'Desde',
      type: 'date',
      width: 155,
    },
    {
      name: 'fechaFin',
      label: 'Hasta',
      type: 'date',
      width: 155,
    },
  ];

  const actions = [
    {
      type: 'view',
      label: 'Ver detalle',
      onClick: handleViewDetail,
    },
    {
      type: 'edit',
      label: 'Cambiar estado',
      disabled: (order) => order.estado_pedido === 'cancelado',
      onClick: handleOpenStatus,
    },
    {
      type: 'receipt',
      label: 'Ver pagos',
      onClick: handleViewPayments,
    },
  ];

  const order = selectedOrder || {};

  return (
    <PlaceholderPage
      title="Pedidos"
      description="Lista pedidos, consulta detalle, revisa pagos asociados y cambia estados administrativos."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />

        {pageNotice && (
          <Alert severity="success" onClose={() => setPageNotice('')}>
            {pageNotice}
          </Alert>
        )}

        <Box>
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
            emptyDescription="Intenta ajustar la busqueda o cambiar los filtros."
            maxHeight={560}
          />
        </Box>
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
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Section title="Pedido">
                  <InfoLine label="N. pedido" value={order.numero_pedido} />
                  <InfoLine label="Estado pedido" value={<StatusBadge value={order.estado_pedido} />} />
                  <InfoLine label="Estado pago" value={<StatusBadge type="payment" value={order.estado_pago} />} />
                  <InfoLine label="Metodo pago" value={order.metodo_pago} />
                  <InfoLine label="Fecha" value={formatDate(order.created_at)} />
                </Section>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Section title="Cliente">
                  <InfoLine label="Nombre" value={order.nombre_cliente} />
                  <InfoLine label="Telefono" value={order.telefono_cliente} />
                  <InfoLine label="Correo" value={order.correo_cliente} />
                </Section>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Section title="Totales e inventario">
                  <InfoLine label="Subtotal" value={formatCurrency(order.subtotal)} />
                  <InfoLine label="Descuento" value={formatCurrency(order.descuento_total)} />
                  <InfoLine label="Envio" value={formatCurrency(order.costo_envio)} />
                  <InfoLine label="Total" value={formatCurrency(order.total)} />
                  <InfoLine label="Reservado" value={order.inventario_reservado ? 'Si' : 'No'} />
                  <InfoLine label="Descontado" value={order.inventario_descontado ? 'Si' : 'No'} />
                </Section>
              </Grid>
            </Grid>

            <Divider />

            <Section title="Items">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>Variante</TableCell>
                    <TableCell>Almacen</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(order.items || []).map((item) => (
                    <TableRow key={item.id || `${item.nombre_producto}-${item.nombre_variante}`}>
                      <TableCell>{item.nombre_producto || '-'}</TableCell>
                      <TableCell>{item.nombre_variante || '-'}</TableCell>
                      <TableCell>{item.almacen_nombre || '-'}</TableCell>
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
                    <TableCell>Cambiado por</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(order.historial_estados || []).map((history) => (
                    <TableRow key={history.id || `${history.estado_nuevo}-${history.created_at}`}>
                      <TableCell>{getOrderStatusLabel(history.estado_anterior)}</TableCell>
                      <TableCell>{getOrderStatusLabel(history.estado_nuevo)}</TableCell>
                      <TableCell>{history.comentario || '-'}</TableCell>
                      <TableCell>{history.cambiado_por || '-'}</TableCell>
                      <TableCell>{formatDate(history.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>

            <Divider />

            <Section title="Notas">
              <InfoLine label="Notas cliente" value={order.notas_cliente} />
              <InfoLine label="Notas internas" value={order.notas_internas} />
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
                Este pedido no tiene pagos registrados.
              </Typography>
            )}

            {(order.pagos || []).map((payment) => (
              <Box
                key={payment.id || payment.referencia_transaccion || payment.created_at}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoLine label="Fecha" value={formatDate(payment.created_at)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoLine label="Metodo" value={payment.metodo_pago} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoLine label="Monto" value={formatCurrency(payment.monto)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoLine label="Estado" value={<StatusBadge type="payment" value={payment.estado} />} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoLine label="Referencia" value={payment.referencia_transaccion} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoLine label="Pagado en" value={formatDate(payment.pagado_at)} />
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
                      <Typography variant="body2" color="text.secondary">
                        Sin comprobante
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={statusOpen} onClose={handleCloseStatus} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmitStatus}>
          <DialogTitle sx={{ pr: 6 }}>
            Cambiar estado del pedido
            <IconButton
              onClick={handleCloseStatus}
              disabled={changingStatus}
              size="small"
              aria-label="Cerrar cambio de estado"
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <ErrorMessage message={formError} />
              <TextField
                label="N. pedido"
                value={statusForm.numeroPedido}
                disabled
              />
              <TextField
                label="Estado actual"
                value={getOrderStatusLabel(statusForm.estadoActual)}
                disabled
              />
              <TextField
                select
                required
                label="Nuevo estado"
                value={statusForm.estadoNuevo}
                onChange={(event) =>
                  setStatusForm((current) => ({
                    ...current,
                    estadoNuevo: event.target.value,
                  }))
                }
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                multiline
                minRows={3}
                label="Comentario"
                value={statusForm.comentario}
                onChange={(event) =>
                  setStatusForm((current) => ({
                    ...current,
                    comentario: event.target.value,
                  }))
                }
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button variant="outlined" onClick={handleCloseStatus} disabled={changingStatus}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                changingStatus ||
                !statusForm.estadoNuevo ||
                statusForm.estadoNuevo === statusForm.estadoActual
              }
            >
              {changingStatus ? 'Cambiando...' : 'Cambiar estado'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </PlaceholderPage>
  );
};
