import { Box } from '@mui/material';
import { DataTable } from '../../../../components/common/dataTable/DataTable';
import { StatusChip } from '../../../../components/common/StatusChip';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

const estadoPedidoColor = (estado) => {
  switch (estado) {
    case 'cancelado':
      return 'error';
    case 'entregado':
      return 'success';
    case 'pendiente':
      return 'warning';
    default:
      return 'info';
  }
};

const estadoPagoColor = (estado) => {
  switch (estado) {
    case 'rechazado':
      return 'error';
    case 'aprobado':
      return 'success';
    case 'pendiente':
      return 'warning';
    default:
      return 'info';
  }
};

export const UltimosPedidosTable = ({ ultimosPedidos = [] }) => {
  const columns = [
    { field: 'numero_pedido', headerName: 'N° Pedido', width: 140 },
    { field: 'nombre_cliente', headerName: 'Cliente', width: 220 },
    {
      field: 'estado_pedido',
      headerName: 'Estado pedido',
      width: 190,
      renderCell: (row) => (
        <StatusChip label={row.estado_pedido} color={estadoPedidoColor(row.estado_pedido)} />
      ),
    },
    {
      field: 'estado_pago',
      headerName: 'Estado pago',
      width: 170,
      renderCell: (row) => (
        <StatusChip label={row.estado_pago} color={estadoPagoColor(row.estado_pago)} />
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 160,
      align: 'right',
      renderCell: (row) => formatCurrency(row.total),
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 170,
      renderCell: (row) => formatDate(row.created_at),
    },
  ];

  const rows = (ultimosPedidos ?? []).map((r, idx) => ({
    id: r.numero_pedido ? `${r.numero_pedido}-${idx}` : idx,
    ...r,
  }));

  return (
    <Box>
      <DataTable
        rows={rows}
        columns={columns}
        emptyTitle="No hay pedidos"
        emptyDescription="No se encontraron últimos pedidos para el rango seleccionado."
        maxHeight={420}
      />
    </Box>
  );
};

