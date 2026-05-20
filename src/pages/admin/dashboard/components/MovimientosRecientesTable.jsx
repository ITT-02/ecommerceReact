import { Box } from '@mui/material';
import { DataTable } from '../../../../components/common/dataTable/DataTable';
import { formatDate } from '../../../../utils/formatters';
import { joinText } from '../../../../utils/formatters';

export const MovimientosRecientesTable = ({ movimientosRecientes = [] }) => {
  const columns = [
    { field: 'tipo_movimiento', headerName: 'Tipo', width: 160 },
    {
      field: 'producto_nombre',
      headerName: 'Producto',
      width: 260,
      renderCell: (row) => (
        <span>
          {joinText(row.producto_nombre, row.nombre_variante)}
        </span>
      ),
    },
    {
      field: 'cantidad',
      headerName: 'Cantidad',
      width: 140,
      align: 'right',
      renderCell: (row) => Number(row.cantidad ?? 0),
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 170,
      renderCell: (row) => formatDate(row.created_at),
    },
  ];

  // backend: { tipo_movimiento, producto_nombre, nombre_variante, cantidad, created_at }
  const rows = (movimientosRecientes ?? []).map((r, idx) => ({
    id: `${r.tipo_movimiento ?? 'mov'}-${idx}`,
    ...r,
  }));

  return (
    <Box>
      <DataTable
        rows={rows}
        columns={columns}
        emptyTitle="No hay movimientos"
        emptyDescription="No se encontraron movimientos recientes para el rango seleccionado."
        maxHeight={420}
      />
    </Box>
  );
};

