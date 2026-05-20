import { Box } from '@mui/material';
import { DataTable } from '../../../../components/common/dataTable/DataTable';
import { StatusChip } from '../../../../components/common/StatusChip';
import { formatCurrency } from '../../../../utils/formatters';

const estadoColor = (estado) => {
  switch (estado) {
    case 'pendiente':
      return 'warning';
    case 'confirmado':
      return 'info';
    case 'preparando':
      return 'primary';
    case 'enviado':
      return 'secondary';
    case 'entregado':
      return 'success';
    case 'cancelado':
      return 'error';
    default:
      return 'default';
  }
};

export const PedidosEstadoTable = ({ pedidosPorEstado = [] }) => {
  const columns = [
    {
      field: 'estado',
      headerName: 'Estado',
      width: 220,
      renderCell: (row) => (
        <StatusChip
          label={row.estado}
          color={estadoColor(row.estado)}
        />
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 160,
      align: 'right',
      renderCell: (row) => formatCurrency(row.total),
    },
  ];

  // backend: { estado, total }
  const rows = (pedidosPorEstado ?? []).map((r, idx) => ({
    id: r.estado ? `${r.estado}-${idx}` : idx,
    estado: r.estado,
    total: r.total,
  }));

  return (
    <Box>
      <DataTable
        rows={rows}
        columns={columns}
        emptyTitle="No hay datos"
        emptyDescription="No se encontraron pedidos por estado para el rango seleccionado."
        maxHeight={380}
      />
    </Box>
  );
};

