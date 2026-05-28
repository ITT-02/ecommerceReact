// Página administrativa: Envíos.
// Controla empresa transportista, guía, URL de rastreo y avance de entrega.

import { useState } from 'react';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { Alert, Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';

import { ShipmentTrackingDialog } from '../../../components/admin/orders/ShipmentTrackingDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  SHIPPING_STATUS_COLOR,
  SHIPPING_STATUS_OPTIONS,
  getPaymentStatusLabel,
  getShippingStatusLabel,
} from '../../../adapters/orderAdapter';
import { useShipments } from '../../../hooks/logistics/useShipments';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const initialTrackingForm = {
  pedidoId: '',
  numeroPedido: '',
  estadoEnvioActual: '',
  estadoEnvio: '',
  empresaEnvio: '',
  numeroSeguimiento: '',
  urlSeguimiento: '',
  comentario: '',
};

export const ShipmentsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estadoEnvio: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState(initialTrackingForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const {
    shipments,
    pagination,
    loading,
    fetching,
    error,
    savingTracking,
    saveTracking,
  } = useShipments({
    pageNumber,
    pageSize,
    search,
    estadoEnvio: filters.estadoEnvio || null,
  });

  const handleOpenTracking = (order) => {
    setSelectedOrder(order);
    setTrackingForm({
      pedidoId: order.id,
      numeroPedido: order.numero_pedido || '',
      estadoEnvioActual: order.estado_envio || 'pendiente',
      estadoEnvio: '',
      empresaEnvio: order.empresa_envio || '',
      numeroSeguimiento: order.numero_seguimiento || '',
      urlSeguimiento: order.url_seguimiento || '',
      comentario: '',
    });
    setFormError('');
    setTrackingOpen(true);
  };

  const handleSubmitTracking = async (event) => {
    event.preventDefault();

    if (!trackingForm.estadoEnvio) {
      setFormError('Selecciona el nuevo estado logístico.');
      return;
    }

    if (
      ['entregado_repartidora', 'en_transito', 'en_destino', 'entregado'].includes(trackingForm.estadoEnvio) &&
      !trackingForm.empresaEnvio.trim()
    ) {
      setFormError('Ingresa la empresa transportista.');
      return;
    }

    try {
      await saveTracking(trackingForm);
      setNotice(`Seguimiento actualizado para ${trackingForm.numeroPedido}.`);
      setTrackingOpen(false);
      setTrackingForm(initialTrackingForm);
    } catch (err) {
      setFormError(err?.response?.data?.message || err.message);
    }
  };

  const columns = [
    {
      field: 'numero_pedido',
      headerName: 'Pedido',
      width: 150,
      renderCell: (row) => <Typography variant="caption" fontWeight={900}>{row.numero_pedido}</Typography>,
    },
    { field: 'nombre_cliente', headerName: 'Cliente', width: 190, emptyText: '-' },
    {
      field: 'estado_envio',
      headerName: 'Estado envío',
      width: 180,
      renderCell: (row) => (
        <Chip
          size="small"
          label={getShippingStatusLabel(row.estado_envio)}
          color={SHIPPING_STATUS_COLOR[row.estado_envio] || 'default'}
          variant="outlined"
        />
      ),
    },
    { field: 'empresa_envio', headerName: 'Transportista', width: 170, emptyText: 'Sin asignar' },
    { field: 'numero_seguimiento', headerName: 'Guía / tracking', width: 170, emptyText: '-' },
    {
      field: 'estado_pago',
      headerName: 'Pago',
      width: 130,
      renderCell: (row) => getPaymentStatusLabel(row.estado_pago),
    },
    { field: 'total', headerName: 'Total', width: 120, renderCell: (row) => formatCurrency(row.total) },
    { field: 'updated_at', headerName: 'Actualizado', width: 150, renderCell: (row) => formatDate(row.updated_at) },
  ];

  const actions = [
    {
      type: 'info',
      label: 'Actualizar envío',
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: handleOpenTracking,
    },
  ];

  return (
    <PlaceholderPage
      title="Despachos y envíos"
      description="Atiende pedidos listos para despacho, registra transportista y actualiza el seguimiento logístico."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight={900}>Pendientes de despacho</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pedidos listos para entregar a transportista o coordinar recojo.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight={900}>En tránsito</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pedidos con transportista asignado y guía registrada.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight={900}>Incidencias</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Casos que requieren revisión antes de cerrar la entrega.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Este módulo muestra pedidos en etapa de despacho. Para pagos, preparación o cancelaciones usa el módulo Pedidos.
          </Typography>
        </Box>

        <AdminResourceTable
          rows={shipments}
          columns={columns}
          actions={actions}
          loading={loading || fetching}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar envío"
          filters={[
            { name: 'estadoEnvio', label: 'Estado envío', type: 'select', width: 210, options: SHIPPING_STATUS_OPTIONS },
          ]}
          filterValues={filters}
          onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
          onFilterChange={(name, value) => { setFilters((current) => ({ ...current, [name]: value })); setPageNumber(1); }}
          onResetFilters={() => { setSearch(''); setFilters({ estadoEnvio: '' }); setPageNumber(1); }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
          emptyTitle="Sin envíos"
          emptyDescription="Aún no hay pedidos para seguimiento logístico."
          maxHeight={560}
        />
      </Stack>

      <ShipmentTrackingDialog
        open={trackingOpen}
        order={selectedOrder}
        form={trackingForm}
        error={formError}
        loading={savingTracking}
        onChange={(name, value) => setTrackingForm((current) => ({ ...current, [name]: value }))}
        onClose={() => setTrackingOpen(false)}
        onSubmit={handleSubmitTracking}
      />
    </PlaceholderPage>
  );
};
