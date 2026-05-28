// Página administrativa: Recepción de mercadería.
// Registra el ingreso de mercadería proveniente de compras o proveedores.

import { useState } from 'react';
import { Chip, Stack, Typography } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useResourceTable } from '../../../hooks/admin/useResourceTable';
import { formatDate } from '../../../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'pendiente_revision', label: 'Pendiente de revisión' },
  { value: 'recibida', label: 'Recibida' },
  { value: 'observada', label: 'Observada' },
  { value: 'anulada', label: 'Anulada' },
];

const getStatusLabel = (value) => STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '-';

export const GoodsReceptionPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estado: '' });

  const { rows, pagination, loading, fetching, error } = useResourceTable({
    queryKey: ['goods-reception-admin'],
    table: 'recepciones_mercaderia',
    select: 'id,orden_compra_id,proveedor_id,almacen_id,estado,documento_referencia,observaciones,created_at,ordenes_compra(numero_orden),proveedores(razon_social),almacenes(nombre)',
    pageNumber,
    pageSize,
    search,
    searchColumns: ['documento_referencia', 'observaciones'],
    filters: filters.estado ? { estado: `eq.${filters.estado}` } : {},
    order: 'created_at.desc',
  });

  return (
    <PlaceholderPage
      title="Recepción de mercadería"
      description="Controla la llegada de mercadería desde proveedores y deja trazabilidad antes de actualizar inventario."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />
        <AdminResourceTable
          rows={rows}
          columns={[
            { field: 'orden', headerName: 'Orden compra', width: 160, renderCell: (row) => <Typography variant="caption" fontWeight={900}>{row.ordenes_compra?.numero_orden || '-'}</Typography> },
            { field: 'proveedor', headerName: 'Proveedor', width: 220, renderCell: (row) => row.proveedores?.razon_social || '-' },
            { field: 'almacen', headerName: 'Almacén', width: 170, renderCell: (row) => row.almacenes?.nombre || '-' },
            { field: 'documento_referencia', headerName: 'Documento', width: 170, emptyText: '-' },
            { field: 'estado', headerName: 'Estado', width: 180, renderCell: (row) => <Chip size="small" label={getStatusLabel(row.estado)} variant="outlined" /> },
            { field: 'observaciones', headerName: 'Observaciones', width: 260, emptyText: '-' },
            { field: 'created_at', headerName: 'Fecha', width: 150, renderCell: (row) => formatDate(row.created_at) },
          ]}
          actions={[]}
          loading={loading || fetching}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar recepción"
          filters={[{ name: 'estado', label: 'Estado', type: 'select', width: 210, options: STATUS_OPTIONS }]}
          filterValues={filters}
          onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
          onFilterChange={(name, value) => { setFilters((current) => ({ ...current, [name]: value })); setPageNumber(1); }}
          onResetFilters={() => { setSearch(''); setFilters({ estado: '' }); setPageNumber(1); }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
          emptyTitle="Sin recepciones"
          emptyDescription="Aquí se registrará la mercadería recibida desde proveedores."
          maxHeight={560}
        />
      </Stack>
    </PlaceholderPage>
  );
};
