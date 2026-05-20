import { Box } from '@mui/material';
import { DataTable } from '../../../../components/common/dataTable/DataTable';
import { StatusChip } from '../../../../components/common/StatusChip';
import { formatCurrency } from '../../../../utils/formatters';

const estadoColor = (estadoStock) => {
  switch (estadoStock) {
    case 'sin_stock':
      return 'error';
    case 'stock_bajo':
      return 'warning';
    case 'normal':
      return 'success';
    default:
      return 'default';
  }
};

export const InventarioCriticoTable = ({ inventarioCritico = [] }) => {
  const columns = [
    { field: 'producto_nombre', headerName: 'Producto', width: 260 },
    { field: 'nombre_variante', headerName: 'Variante', width: 200 },
    { field: 'almacen_nombre', headerName: 'Almacén', width: 200 },

    {
      field: 'cantidad_disponible',
      headerName: 'Disponible',
      width: 160,
      align: 'right',
      renderCell: (row) => Number(row.cantidad_disponible ?? 0),
    },
    {
      field: 'cantidad_reservada',
      headerName: 'Reservado',
      width: 160,
      align: 'right',
      renderCell: (row) => Number(row.cantidad_reservada ?? 0),
    },
    {
      field: 'stock_minimo',
      headerName: 'Stock mínimo',
      width: 170,
      align: 'right',
      renderCell: (row) => Number(row.stock_minimo ?? 0),
    },
    {
      field: 'estado_stock',
      headerName: 'Estado',
      width: 180,
      renderCell: (row) => (
        <StatusChip label={row.estado_stock} color={estadoColor(row.estado_stock)} />
      ),
    },
  ];

  // backend: { producto_nombre, nombre_variante, almacen_nombre, cantidad_disponible, cantidad_reservada, stock_minimo, estado_stock }
  const rows = (inventarioCritico ?? []).map((r, idx) => ({
    id: `${r.producto_nombre ?? 'prod'}-${r.nombre_variante ?? 'var'}-${idx}`,
    ...r,
  }));

  return (
    <Box>
      <DataTable
        rows={rows}
        columns={columns}
        emptyTitle="No hay inventario crítico"
        emptyDescription="No se encontraron productos con stock crítico para el rango seleccionado."
        maxHeight={420}
      />
    </Box>
  );
};

