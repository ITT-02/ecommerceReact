import { useMemo, useState } from 'react';

import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import {
  Alert,
  Chip,
  Stack,
  Typography,
} from '@mui/material';

import { ShipmentTrackingDialog } from '../../../components/admin/orders/ShipmentTrackingDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  SHIPPING_REQUIRED_ADVANCE_VALUES,
  SHIPPING_STATUS_COLOR,
  SHIPPING_STATUS_OPTIONS,
  getPaymentStatusLabel,
  getShippingStatusLabel,
} from '../../../adapters/orderAdapter';
import { useShipments } from '../../../hooks/logistics/useShipments';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const getInitialShipmentFilters = () =>
  getDefaultAdminDateFilters({
    extraFilters: {
      estadoEnvio: '',
    },
  });

const initialTrackingForm = {
  pedidoId: '',
  numeroPedido: '',
  estadoEnvioActual: '',
  estadoEnvio: '',
  transportistaId: '',
  empresaEnvio: '',
  numeroSeguimiento: '',
  urlSeguimiento: '',
  comentario: '',
};

export const ShipmentsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(getInitialShipmentFilters);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState(initialTrackingForm);

  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const rangoFechasInvalido = isDateRangeInvalid({ values: filters });

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
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });

  const handleOpenTracking = (order) => {
    setSelectedOrder(order);

    setTrackingForm({
      pedidoId: order.id,
      numeroPedido: order.numero_pedido || '',
      estadoEnvioActual: order.estado_envio || 'pendiente',
      estadoEnvio: '',
      transportistaId: order.transportista_id || '',
      empresaEnvio: order.empresa_envio || '',
      numeroSeguimiento: order.numero_seguimiento || '',
      urlSeguimiento: order.url_seguimiento || '',
      comentario: '',
    });

    setFormError('');
    setNotice('');
    setTrackingOpen(true);
  };

  const handleCloseTracking = () => {
    if (savingTracking) return;

    setTrackingOpen(false);
    setSelectedOrder(null);
    setTrackingForm(initialTrackingForm);
    setFormError('');
  };

  const handleTrackingChange = (name, value) => {
    setTrackingForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError('');
  };

  const handleSubmitTracking = async (event) => {
    event.preventDefault();

    if (!trackingForm.estadoEnvio) {
      setFormError('Selecciona el siguiente estado del envío.');
      return;
    }

    const requiereTransportista = SHIPPING_REQUIRED_ADVANCE_VALUES.includes(
      trackingForm.estadoEnvio
    );

    if (requiereTransportista && !trackingForm.transportistaId) {
      setFormError('Selecciona la empresa transportista.');
      return;
    }

    if (trackingForm.estadoEnvio === 'incidencia' && !trackingForm.comentario.trim()) {
      setFormError('Describe la incidencia en el comentario.');
      return;
    }

    try {
      await saveTracking(trackingForm);

      setNotice(`Seguimiento actualizado para ${trackingForm.numeroPedido}.`);
      setTrackingOpen(false);
      setSelectedOrder(null);
      setTrackingForm(initialTrackingForm);
      setFormError('');
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
    {
      field: 'nombre_cliente',
      headerName: 'Cliente',
      width: 190,
      emptyText: '-',
    },
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
    {
      field: 'empresa_envio',
      headerName: 'Transportista',
      width: 170,
      emptyText: 'Sin asignar',
    },
    {
      field: 'numero_seguimiento',
      headerName: 'Guía / tracking',
      width: 170,
      emptyText: '-',
    },
    {
      field: 'estado_pago',
      headerName: 'Pago',
      width: 130,
      renderCell: (row) => getPaymentStatusLabel(row.estado_pago),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      renderCell: (row) => formatCurrency(row.total),
    },
    {
      field: 'updated_at',
      headerName: 'Actualizado',
      width: 150,
      renderCell: (row) => formatDate(row.updated_at),
    },
  ];

  const actions = [
    {
      type: 'info',
      label: 'Actualizar envío',
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 17 }} />,
      onClick: handleOpenTracking,
    },
  ];

  const tableFilters = useMemo(
    () => [
      {
        name: 'estadoEnvio',
        label: 'Estado envío',
        type: 'select',
        width: 210,
        options: SHIPPING_STATUS_OPTIONS,
      },
      {
        name: 'fechaInicio',
        label: 'Desde',
        type: 'date',
        width: 155,
        maxDate: filters.fechaFin || undefined,
      },
      {
        name: 'fechaFin',
        label: 'Hasta',
        type: 'date',
        width: 155,
        minDate: filters.fechaInicio || undefined,
      },
    ],
    [filters.fechaInicio, filters.fechaFin]
  );

  return (
    <PlaceholderPage
      title="Despachos y envíos"
      description="Registra transportista, guía de rastreo, incidencias y entrega final de los pedidos."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />

        {rangoFechasInvalido && (
          <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />
        )}

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <AdminResourceTable
          rows={rangoFechasInvalido ? [] : shipments}
          columns={columns}
          actions={actions}
          loading={loading || fetching}
          pagination={rangoFechasInvalido ? emptyPagination({ pageNumber, pageSize }) : pagination}
          searchValue={search}
          searchLabel="Buscar envío"
          filters={tableFilters}
          filterValues={filters}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            setFilters((current) => ({
              ...current,
              [name]: value,
            }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setSearch('');
            setFilters(getInitialShipmentFilters());
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
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
        onChange={handleTrackingChange}
        onClose={handleCloseTracking}
        onSubmit={handleSubmitTracking}
      />
    </PlaceholderPage>
  );
};