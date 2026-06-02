// Página administrativa: Reembolsos.
// Visualiza devoluciones registradas desde Pedidos y sus referencias de pago.

import { useMemo, useState } from 'react';
import { Chip, Stack, Typography } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useRefunds } from '../../../hooks/finance/useRefunds';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const REFUND_STATUS_LABEL = {
  registrado: 'Registrado',
  anulado: 'Anulado',
};

const REFUND_STATUS_COLOR = {
  registrado: 'success',
  anulado: 'default',
};

const getDefaultFilterValues = () =>
  getDefaultAdminDateFilters({
    extraFilters: {
      estado: '',
    },
  });

export const RefundsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState(getDefaultFilterValues);

  const estado = filterValues.estado || null;
  const fechaInicio = filterValues.fechaInicio || null;
  const fechaFin = filterValues.fechaFin || null;

  const rangoFechasInvalido = isDateRangeInvalid({ values: filterValues });

  const { refunds, pagination, loading, fetching, error } = useRefunds({
    pageNumber,
    pageSize,
    search,
    estado,
    fechaInicio: rangoFechasInvalido ? null : fechaInicio,
    fechaFin: rangoFechasInvalido ? null : fechaFin,
  });

  const filters = useMemo(
    () => [
      {
        name: 'estado',
        label: 'Estado',
        type: 'select',
        options: [
          { label: 'Registrado', value: 'registrado' },
          { label: 'Anulado', value: 'anulado' },
        ],
      },
      {
        name: 'fechaInicio',
        label: 'Desde',
        type: 'date',
        maxDate: filterValues.fechaFin || undefined,
      },
      {
        name: 'fechaFin',
        label: 'Hasta',
        type: 'date',
        minDate: filterValues.fechaInicio || undefined,
      },
    ],
    [filterValues.fechaInicio, filterValues.fechaFin]
  );

  const columns = [
    {
      field: 'numero_pedido',
      headerName: 'Pedido',
      width: 150,
      renderCell: (row) => (
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {row.numero_pedido || 'Sin número'}
          </Typography>
      ),
    },
    {
      field: 'nombre_cliente',
      headerName: 'Cliente',
      width: 200,
      emptyText: '-',
    },
    {
      field: 'monto',
      headerName: 'Monto',
      width: 130,
      renderCell: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>
          {formatCurrency(row.monto)}
        </Typography>
      ),
    },
    {
      field: 'metodo_reembolso',
      headerName: 'Método',
      width: 165,
      emptyText: '-',
    },
    {
      field: 'referencia_reembolso',
      headerName: 'Referencia',
      width: 190,
      emptyText: '-',
    },
    {
      field: 'motivo',
      headerName: 'Motivo',
      width: 260,
      emptyText: '-',
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      renderCell: (row) => (
        <Chip
          size="small"
          label={REFUND_STATUS_LABEL[row.estado] || row.estado || '-'}
          color={REFUND_STATUS_COLOR[row.estado] || 'default'}
          variant="outlined"
          sx={{ fontWeight: 800 }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 160,
      renderCell: (row) => formatDate(row.created_at),
    },
  ];

  return (
    <PlaceholderPage
      title="Reembolsos"
      description="Consulta los reembolsos registrados por periodo y sus referencias para cerrar devoluciones de pedidos pagados. Por defecto se muestra el mes actual."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />

        {rangoFechasInvalido && (
          <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />
        )}

        <AdminResourceTable
          rows={rangoFechasInvalido ? [] : refunds}
          columns={columns}
          actions={[]}
          loading={loading || fetching}
          pagination={
            rangoFechasInvalido
              ? emptyPagination({ pageNumber, pageSize })
              : pagination
          }
          searchValue={search}
          searchLabel="Buscar por pedido, cliente, método, referencia o motivo"
          filters={filters}
          filterValues={filterValues}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            setFilterValues((current) => ({ ...current, [name]: value }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setSearch('');
            setFilterValues(getDefaultFilterValues());
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          emptyTitle="Sin reembolsos"
          emptyDescription="Los reembolsos se registran desde pedidos cuando corresponde devolver un pago."
          maxHeight={560}
        />
      </Stack>
    </PlaceholderPage>
  );
};
