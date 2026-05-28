// Página administrativa: Reembolsos.
// Visualiza devoluciones registradas desde Pedidos y sus referencias de pago.

import { useState } from 'react';
import { Chip, Stack, Typography } from '@mui/material';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useResourceTable } from '../../../hooks/admin/useResourceTable';
import { formatCurrency, formatDate } from '../../../utils/formatters';

export const RefundsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { rows, pagination, loading, fetching, error } = useResourceTable({
    queryKey: ['refunds-admin'],
    table: 'pago_reembolsos',
    select: 'id,pedido_id,pago_id,monto,metodo_reembolso,referencia_reembolso,motivo,estado,created_at,pedidos(numero_pedido,nombre_cliente,total,estado_pago)',
    pageNumber,
    pageSize,
    search,
    searchColumns: ['metodo_reembolso', 'referencia_reembolso', 'motivo'],
    order: 'created_at.desc',
  });

  const columns = [
    {
      field: 'pedido_id',
      headerName: 'Pedido',
      width: 155,
      renderCell: (row) => <Typography variant="caption" fontWeight={900}>{row.pedidos?.numero_pedido || row.pedido_id}</Typography>,
    },
    { field: 'cliente', headerName: 'Cliente', width: 190, renderCell: (row) => row.pedidos?.nombre_cliente || '-' },
    { field: 'monto', headerName: 'Monto', width: 130, renderCell: (row) => formatCurrency(row.monto) },
    { field: 'metodo_reembolso', headerName: 'Método', width: 170 },
    { field: 'referencia_reembolso', headerName: 'Referencia', width: 190, emptyText: '-' },
    { field: 'motivo', headerName: 'Motivo', width: 260, emptyText: '-' },
    { field: 'estado', headerName: 'Estado', width: 120, renderCell: (row) => <Chip size="small" label={row.estado} variant="outlined" /> },
    { field: 'created_at', headerName: 'Fecha', width: 150, renderCell: (row) => formatDate(row.created_at) },
  ];

  return (
    <PlaceholderPage
      title="Reembolsos"
      description="Consulta los reembolsos registrados y sus referencias para cerrar devoluciones de pedidos pagados."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />
        <AdminResourceTable
          rows={rows}
          columns={columns}
          actions={[]}
          loading={loading || fetching}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar reembolso"
          filters={[]}
          filterValues={{}}
          onSearchChange={(value) => { setSearch(value); setPageNumber(1); }}
          onFilterChange={() => {}}
          onResetFilters={() => { setSearch(''); setPageNumber(1); }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => { setPageSize(value); setPageNumber(1); }}
          emptyTitle="Sin reembolsos"
          emptyDescription="Los reembolsos se registran desde pedidos cuando corresponde devolver un pago."
          maxHeight={560}
        />
      </Stack>
    </PlaceholderPage>
  );
};
