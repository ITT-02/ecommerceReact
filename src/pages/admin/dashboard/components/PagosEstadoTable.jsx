import { Box } from '@mui/material';
import { DataTable } from '../../../../components/common/dataTable/DataTable';
import { StatusChip } from '../../../../components/common/StatusChip';
import { formatCurrency } from '../../../../utils/formatters';

const estadoColor = (estado) => {
  switch (estado) {
    case 'aprobado':
      return 'success';
    case 'pendiente':
      return 'warning';
    case 'rechazado':
      return 'error';
    default:
      return 'default';
  }
};

export const PagosEstadoTable = ({ pagosPorEstado = [] }) => {
  const columns = [
    {
      field: 'estado',
      headerName: 'Estado',
      width: 220,
      renderCell: (row) => (
        <StatusChip label={row.estado} color={estadoColor(row.estado)} />
      ),
    },
    {
      field: 'total',
      headerName: 'Cantidad',
      width: 160,
      align: 'right',
      renderCell: (row) => Number(row.total ?? 0),
    },
    {
      field: 'monto_total',
      headerName: 'Monto',
      width: 220,
      align: 'right',
      renderCell: (row) => formatCurrency(row.monto_total),
    },
  ];

  // backend: { estado, total, monto_total }
  const rows = (pagosPorEstado ?? []).map((r, idx) => ({
    id: r.estado ? `${r.estado}-${idx}` : idx,
    estado: r.estado,
    total: r.total,
    monto_total: r.monto_total,
  }));

  return (
    <Box>
      <DataTable
        rows={rows}
        columns={columns}
        emptyTitle="No hay datos"
        emptyDescription="No se encontraron pagos por estado para el rango seleccionado."
        maxHeight={380}
      />
    </Box>
  );
};

