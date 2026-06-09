// Módulo administrativo: Finanzas / Ganancias.
// Permite revisar ventas, costos, utilidad, margen y liquidaciones de socios.

import { useMemo, useState } from 'react';
import AttachMoneyOutlinedIcon from '@mui/icons-material/AttachMoneyOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import ShowChartOutlinedIcon from '@mui/icons-material/ShowChartOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { Alert, Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useAdminFinance } from '../../../hooks/finance/useAdminFinance';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const getInitialFilters = () =>
  getDefaultAdminDateFilters({
    extraFilters: {},
  });

const KpiCard = ({ title, value, description, icon, color = 'primary.main' }) => (
  <Card sx={(theme) => ({ height: '100%', borderRadius: theme.palette.custom.radius.xs })}>
    <CardContent>
      <Stack spacing={1.5}>
        <Box sx={(theme) => ({ width: 42, height: 42, borderRadius: theme.palette.custom.radius.xs, display: 'grid', placeItems: 'center', bgcolor: 'action.selected', color })}>
          {icon}
        </Box>
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '.16em', fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </Stack>
    </CardContent>
  </Card>
);

export const FinancePage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(getInitialFilters);

  const rangoFechasInvalido = isDateRangeInvalid({ values: filters });

  const { summary, orders, pagination, loading, fetching, error } = useAdminFinance({
    pageNumber,
    pageSize,
    search,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });

  const handleSearchChange = (value) => {
    setSearch(value);
    setPageNumber(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters(getInitialFilters());
    setPageNumber(1);
  };

  const columns = [
    { field: 'numero_pedido', headerName: 'Pedido', width: 150, renderCell: (row) => (
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
            {row.numero_pedido || 'Sin número'}
          </Typography>
      ), },
    { field: 'created_at', headerName: 'Fecha', width: 120, renderCell: (row) => formatDate(row.created_at) },
    { field: 'canal_venta', headerName: 'Canal', width: 120, type: 'chip' },
    {
      field: 'cliente_mayorista_aprobado',
      headerName: 'Cliente',
      width: 130,
      renderCell: (row) => (row.cliente_mayorista_aprobado ? 'Mayorista' : 'Minorista'),
    },
    { field: 'nombre_cliente', headerName: 'Cliente', width: 200, emptyText: 'Cliente general' },
    { field: 'total', headerName: 'Venta', type: 'currency', width: 100 },
    { field: 'costo_total', headerName: 'Costo', type: 'currency', width: 100 },
    { field: 'venta_socio_total', headerName: 'Venta socio', type: 'currency', width: 120 },
    { field: 'comision_aliqora_socios_total', headerName: 'Comisión Aliqora', type: 'currency', width: 150 },
    { field: 'liquidacion_socio_total', headerName: 'Liquidación socio', type: 'currency', width: 150 },
    { field: 'utilidad_aliqora_total', headerName: 'Utilidad Aliqora', type: 'currency', width: 150 },
    { field: 'margen_porcentaje', headerName: 'Margen', width: 110, renderCell: (row) => `${Number(row.margen_porcentaje || 0).toFixed(2)}%` },
    { field: 'estado_pago', headerName: 'Pago', type: 'chip', width: 120 },
  ];

  const tableFilters = useMemo(
    () => [
      {
        name: 'fechaInicio',
        label: 'Desde',
        type: 'date',
        width: 160,
        maxDate: filters.fechaFin || undefined,
      },
      {
        name: 'fechaFin',
        label: 'Hasta',
        type: 'date',
        width: 160,
        minDate: filters.fechaInicio || undefined,
      },
    ],
    [filters.fechaInicio, filters.fechaFin]
  );

  return (
    <PlaceholderPage title="Finanzas" description="Controla ventas pagadas, utilidad Aliqora, liquidaciones de socios y ventas mayoristas aprobadas por periodo.">
      <Stack spacing={2.5}>
        <ErrorMessage message={error} />

        {rangoFechasInvalido && (
          <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />
        )}

        {fetching && <Alert severity="info">Actualizando indicadores financieros...</Alert>}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Ventas netas" value={formatCurrency(summary.total_ventas)} description="Total de pedidos pagados en el periodo." icon={<AttachMoneyOutlinedIcon />} color="primary.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Costo total" value={formatCurrency(summary.costo_total)} description="Costo estimado de los productos vendidos." icon={<PointOfSaleOutlinedIcon />} color="warning.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Utilidad Aliqora" value={formatCurrency(summary.utilidad_aliqora_total ?? summary.utilidad_total)} description="Venta menos costo propio y liquidación a socios." icon={<TrendingUpOutlinedIcon />} color="success.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Margen" value={`${Number(summary.margen_porcentaje || 0).toFixed(2)}%`} description="Porcentaje de utilidad sobre ventas." icon={<ShowChartOutlinedIcon />} color="secondary.main" />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Ventas mayoristas" value={formatCurrency(summary.ventas_mayoristas)} description="Solo clientes aprobados como mayoristas." icon={<AttachMoneyOutlinedIcon />} color="secondary.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Ventas minoristas" value={formatCurrency(summary.ventas_minoristas)} description="Clientes normales y compras sin aprobación mayorista." icon={<PointOfSaleOutlinedIcon />} color="info.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Ventas de socios" value={formatCurrency(summary.venta_socio_total)} description="Importe cobrado por productos de socios en el periodo." icon={<TrendingUpOutlinedIcon />} color="warning.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Liquidación socios" value={formatCurrency(summary.liquidacion_socio_total ?? summary.comision_socio_total ?? 0)} description="Monto estimado a devolver o pagar a socios por ventas pagadas." icon={<PointOfSaleOutlinedIcon />} color="info.main" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard title="Comisión Aliqora socios" value={formatCurrency(summary.comision_aliqora_socios_total ?? 0)} description="Ganancia que Aliqora retiene por ventas de socios." icon={<ShowChartOutlinedIcon />} color="success.main" />
          </Grid>
        </Grid>

        <AdminResourceTable
          rows={rangoFechasInvalido ? [] : orders}
          columns={columns}
          actions={[]}
          loading={loading || fetching}
          pagination={rangoFechasInvalido ? emptyPagination({ pageNumber, pageSize }) : pagination}
          searchValue={search}
          searchLabel="Buscar pedido o cliente"
          filters={tableFilters}
          filterValues={filters}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
          emptyTitle="Sin ventas pagadas"
          emptyDescription="No hay información financiera para los filtros seleccionados."
          maxHeight={560}
        />
      </Stack>
    </PlaceholderPage>
  );
};
