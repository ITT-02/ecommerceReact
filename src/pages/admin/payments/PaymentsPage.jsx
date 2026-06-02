import { useMemo, useState } from 'react';
import { Chip, Stack, Typography } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { ChangePaymentStatusDialog } from './components/ChangePaymentStatusDialog';
import { PaymentDetailDialog } from './components/PaymentDetailDialog';
import { RelatedOrderDialog } from './components/RelatedOrderDialog';
import { useAdminPayments, usePaymentMethodOptions } from '../../../hooks/sales/useAdminPayments';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const getDefaultPaymentFilters = () =>
  getDefaultAdminDateFilters({
    startKey: 'fecha_inicio',
    endKey: 'fecha_fin',
    extraFilters: {
      estado: '',
      metodo_pago: '',
    },
  });

export const PaymentsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState(getDefaultPaymentFilters);

  const estadoPago = filterValues?.estado === 'todos' ? null : filterValues?.estado;
  const metodoPago = filterValues?.metodo_pago === 'todos' ? null : filterValues?.metodo_pago;
  const fechaInicio = filterValues?.fecha_inicio || null;
  const fechaFin = filterValues?.fecha_fin || null;

  const rangoFechasInvalido = isDateRangeInvalid({
    values: filterValues,
    startKey: 'fecha_inicio',
    endKey: 'fecha_fin',
  });

  const {
    pagos,
    pagination,
    isLoading,
    error,
    updateStatus,
    isUpdating,
  } = useAdminPayments({
    pageNumber,
    pageSize,
    search,
    estado: estadoPago || null,
    metodoPago: metodoPago || null,
    fechaInicio,
    fechaFin,
  });

  const [pagoDetalle, setPagoDetalle] = useState(null);
  const [pagoCambiarEstado, setPagoCambiarEstado] = useState(null);
  const [pedidoRelacionado, setPedidoRelacionado] = useState(null);

  const getStatusColor = (estado) => {
    const colors = {
      pendiente: 'warning',
      validando: 'info',
      en_validacion: 'info',
      aprobado: 'success',
      pagado: 'success',
      rechazado: 'error',
      vencido: 'error',
      cancelado: 'default',
      reembolso_pendiente: 'warning',
      reembolsado: 'info',
    };
    return colors[estado] || 'default';
  };

  const getStatusLabel = (estado) => {
    const labels = {
      pendiente: 'Pendiente',
      validando: 'En validación',
      en_validacion: 'En validación',
      aprobado: 'Aprobado',
      pagado: 'Pagado',
      rechazado: 'Rechazado',
      vencido: 'Vencido',
      cancelado: 'Cancelado',
      reembolso_pendiente: 'Reembolso pendiente',
      reembolsado: 'Reembolsado',
    };
    return labels[estado] || estado || '-';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(fechaStr));
  };

  const {
    data: paymentMethodOptions = [],
    isLoading: isLoadingPaymentMethods,
  } = usePaymentMethodOptions();

  const columns = [
    {
      field: 'numero_pedido',
      headerName: 'N° Pedido',
      width: 130,
      renderCell: (row) => (
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.78rem',
            color: 'text.primary',
          }}
        >
          {row.numero_pedido}
        </Typography>
      ),
    },
    { field: 'nombre_cliente', headerName: 'Cliente', width: 220 },
    { field: 'metodo_pago', headerName: 'Método', width: 120, renderCell: (row) => <Typography sx={{ textTransform: 'capitalize' }}>{row.metodo_pago}</Typography> },
    { field: 'monto', headerName: 'Monto', width: 110, renderCell: (row) => <Typography sx={{ fontWeight: 'bold', color: 'primary.main' }}>{formatCurrency(row.monto)}</Typography> },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      renderCell: (row) => (
        <Chip
          label={getStatusLabel(row.estado)}
          size="small"
          color={getStatusColor(row.estado)}
          variant="filled"
          sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem' }}
        />
      ),
    },
    { field: 'referencia_transaccion', headerName: 'Referencia', width: 150 },
    { field: 'created_at', headerName: 'Fecha', width: 160, renderCell: (row) => <Typography variant="caption">{formatFecha(row.created_at)}</Typography> },
  ];

  const rowActions = [
    {
      type: 'view',
      label: 'Ver Detalle del Pago',
      onClick: (row) => setPagoDetalle(row),
    },
    {
      type: 'edit',
      label: 'Validar pago',
      onClick: (row) => setPagoCambiarEstado(row),
    },
    {
      icon: <ShoppingBagOutlinedIcon color="secondary" />,
      label: 'Ver Pedido Relacionado',
      onClick: (row) => setPedidoRelacionado(row),
    },
  ];

  const filtersConfig = useMemo(() => [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      options: [
        { label: 'Pendientes', value: 'pendiente' },
        { label: 'En validación', value: 'validando' },
        { label: 'Aprobados', value: 'aprobado' },
        { label: 'Rechazados', value: 'rechazado' },
        { label: 'Vencidos', value: 'vencido' },
      ],
    },
    {
      name: 'metodo_pago',
      label: 'Método',
      type: 'select',
      options: paymentMethodOptions,
    },
    {
      name: 'fecha_inicio',
      label: 'Desde',
      type: 'date',
      width: 155,
      maxDate: filterValues.fecha_fin || undefined,
      disableFuture: true,
    },
    {
      name: 'fecha_fin',
      label: 'Hasta',
      type: 'date',
      width: 155,
      minDate: filterValues.fecha_inicio || undefined,
      disableFuture: true,
    },
  ], [
    paymentMethodOptions,
    filterValues.fecha_inicio,
    filterValues.fecha_fin,
  ]);

  return (
    <PlaceholderPage
      title="Gestión de Pagos"
      description="Revisa comprobantes y administra los estados de pago de los pedidos."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error?.message || error} />

        {rangoFechasInvalido && (
          <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />
        )}

        <AdminResourceTable
          rows={rangoFechasInvalido ? [] : pagos}
          columns={columns}
          actions={rowActions}
          loading={isLoading || isLoadingPaymentMethods}
          pagination={rangoFechasInvalido ? emptyPagination({ pageNumber, pageSize }) : pagination}
          searchValue={search}
          searchLabel="Buscar por N° pedido, cliente o referencia..."
          onSearchChange={(val) => { setSearch(val); setPageNumber(1); }}
          filterValues={filterValues}
          filters={filtersConfig}
          onFilterChange={(name, val) => {
            setFilterValues((prev) => ({ ...prev, [name]: val }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setSearch('');
            setFilterValues(getDefaultPaymentFilters());
            setPageNumber(1);
          }}
          onPageChange={(page) => setPageNumber(page)}
          onPageSizeChange={(size) => { setPageSize(size); setPageNumber(1); }}
          primaryActionLabel={null}
          emptyTitle="No se encontraron pagos"
          emptyDescription="No hay registros de pago que coincidan con la búsqueda actual."
        />
      </Stack>

      <ChangePaymentStatusDialog
        open={Boolean(pagoCambiarEstado)}
        pago={pagoCambiarEstado}
        isUpdating={isUpdating}
        onClose={() => setPagoCambiarEstado(null)}
        onConfirm={updateStatus}
      />

      <PaymentDetailDialog
        open={Boolean(pagoDetalle)}
        pagoId={pagoDetalle?.id}
        onClose={() => setPagoDetalle(null)}
      />

      <RelatedOrderDialog
        open={Boolean(pedidoRelacionado)}
        pedidoId={pedidoRelacionado?.pedido_id}
        onClose={() => setPedidoRelacionado(null)}
      />
    </PlaceholderPage>
  );
};