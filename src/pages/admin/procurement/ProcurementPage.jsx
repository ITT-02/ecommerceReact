// Página administrativa: Compras / abastecimiento.
// Registra solicitudes u órdenes de compra para cubrir bajo pedido y reposición.

import { useState } from 'react';
import { Alert, Chip, Stack, Typography } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useResourceTable } from '../../../hooks/admin/useResourceTable';
import { formatCurrency, formatDate } from '../../../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'solicitada', label: 'Solicitada' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'recibida_parcial', label: 'Recibida parcial' },
  { value: 'recibida', label: 'Recibida' },
  { value: 'cancelada', label: 'Cancelada' },
];

const STATUS_COLOR = {
  borrador: 'default',
  solicitada: 'warning',
  aprobada: 'info',
  recibida_parcial: 'secondary',
  recibida: 'success',
  cancelada: 'error',
};

const getStatusLabel = (value) => STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '-';

export const ProcurementPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estado: '' });

  const { rows, pagination, loading, fetching, error } = useResourceTable({
    queryKey: ['purchase-orders-admin'],
    table: 'ordenes_compra',
    select: 'id,numero_orden,proveedor_id,pedido_id,estado,total_estimado,fecha_estimada_recepcion,created_at,proveedores(razon_social),pedidos(numero_pedido)',
    pageNumber,
    pageSize,
    search,
    searchColumns: ['numero_orden'],
    filters: filters.estado ? { estado: `eq.${filters.estado}` } : {},
    order: 'created_at.desc',
  });

  return (
    <PlaceholderPage
      title="Compras / abastecimiento"
      description="Controla órdenes de compra generadas por falta de stock, bajo pedido o reposición de inventario."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />
        <AdminResourceTable
          rows={rows}
          columns={[
            { field: 'numero_orden', headerName: 'Orden', width: 150, renderCell: (row) => <Typography variant="caption" fontWeight={900}>{row.numero_orden}</Typography> },
            { field: 'proveedor', headerName: 'Proveedor', width: 220, renderCell: (row) => row.proveedores?.razon_social || '-' },
            { field: 'pedido', headerName: 'Pedido origen', width: 150, renderCell: (row) => row.pedidos?.numero_pedido || '-' },
            { field: 'estado', headerName: 'Estado', width: 150, renderCell: (row) => <Chip size="small" label={getStatusLabel(row.estado)} color={STATUS_COLOR[row.estado] || 'default'} variant="outlined" /> },
            { field: 'total_estimado', headerName: 'Total estimado', width: 140, renderCell: (row) => formatCurrency(row.total_estimado) },
            { field: 'fecha_estimada_recepcion', headerName: 'Recepción estimada', width: 170, renderCell: (row) => formatDate(row.fecha_estimada_recepcion) },
            { field: 'created_at', headerName: 'Fecha', width: 150, renderCell: (row) => formatDate(row.created_at) },
          ]}
          actions={[]}
          loading={loading || fetching}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar orden"
          filters={[{ name: 'estado', label: 'Estado', type: 'select', width: 190, options: STATUS_OPTIONS }]}
          filterValues={filters}
          onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
          onFilterChange={(name, value) => { setFilters((current) => ({ ...current, [name]: value })); setPageNumber(1); }}
          onResetFilters={() => { setSearch(''); setFilters({ estado: '' }); setPageNumber(1); }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
          emptyTitle="Sin órdenes de compra"
          emptyDescription="Aquí aparecerán las compras generadas por abastecimiento o reposición."
          maxHeight={560}
        />
      </Stack>
    </PlaceholderPage>
  );
};
