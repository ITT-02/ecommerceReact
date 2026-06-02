import { useMemo, useState } from 'react';
import { Chip, Typography } from '@mui/material';
import { MovementForm } from './componentsMovements/MovementForm';
import { CancelMovementDialog } from './componentsMovements/CancelMovementDialog';
import { MovementDetailDialog } from './componentsMovements/MovementDetailDialog';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { useInventoryMovements } from '../../../hooks/inventory/useInventoryMovements';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const getInitialMovementFilters = () =>
  getDefaultAdminDateFilters({
    extraFilters: {
      tipoMovimiento: '',
    },
  });

export const MovementsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState(getInitialMovementFilters);

  const tipoMovimiento =
    filterValues?.tipoMovimiento === 'todos' ? null : filterValues?.tipoMovimiento;

  const rangoFechasInvalido = isDateRangeInvalid({ values: filterValues });

  const {
    movements,
    pagination,
    isLoading,
    isFetching,
    error,
    cancelMovement,
    isCanceling,
    registerMovement,
    isRegistering,
  } = useInventoryMovements({
    pageNumber,
    pageSize,
    search,
    tipoMovimiento: tipoMovimiento || null,
    fechaInicio: filterValues.fechaInicio || null,
    fechaFin: filterValues.fechaFin || null,
  });

  const [movimientoAnular, setMovimientoAnular] = useState(null);
  const [movimientoDetalle, setMovimientoDetalle] = useState(null);
  const [openRegistrarModal, setOpenRegistrarModal] = useState(false);

  const getTipoColor = (tipo) => {
    const colors = {
      entrada: 'success',
      salida: 'error',
      ajuste: 'warning',
      reserva: 'info',
      liberacion: 'secondary',
      anulacion: 'default',
    };
    return colors[tipo] || 'default';
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(fechaStr));
  };

  const columns = [
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 155,
      renderCell: (row) => <Typography variant="caption">{formatFecha(row.created_at)}</Typography>,
    },
    {
      field: 'tipo_movimiento',
      headerName: 'Tipo',
      width: 120,
      renderCell: (row) => (
        <Chip
          label={row.tipo_movimiento}
          size="small"
          color={getTipoColor(row.tipo_movimiento)}
          sx={{ textTransform: 'capitalize' }}
          variant="filled"
        />
      ),
    },
    {
      field: 'producto_nombre',
      headerName: 'Producto',
      width: 190,
      renderCell: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.producto_nombre}</Typography>,
    },
    { field: 'nombre_variante', headerName: 'Variante', width: 140 },
    { field: 'almacen_nombre', headerName: 'Almacén', width: 130 },
    {
      field: 'cantidad',
      headerName: 'Cant.',
      align: 'center',
      width: 80,
      renderCell: (row) => <Typography sx={{ fontWeight: 'bold' }}>{row.cantidad}</Typography>,
    },
    {
      field: 'referencia_tipo',
      headerName: 'Motivo',
      width: 140,
      renderCell: (row) => (
        <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
          {row.referencia_tipo?.replace('_', ' ')}
        </Typography>
      ),
    },
    {
      field: 'anulado',
      headerName: 'Anulado',
      align: 'center',
      width: 90,
      renderCell: (row) => (
        <Chip
          label={row.anulado ? 'Sí' : 'No'}
          size="small"
          color={row.anulado ? 'success' : 'error'}
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
  ];

  const rowActions = [
    {
      type: 'view',
      label: 'Ver detalle',
      onClick: (row) => setMovimientoDetalle(row),
    },
    {
      type: 'cancel',
      label: 'Anular',
      disabled: (row) => row.anulado || row.referencia_tipo === 'anulacion' || row.referencia_tipo === 'recepcion_mercaderia',
      onClick: (row) => setMovimientoAnular(row),
    },
  ];

  const filtersConfig = useMemo(
    () => [
      {
        name: 'tipoMovimiento',
        label: 'Tipo Movimiento',
        type: 'select',
        options: [
          { label: 'Entradas', value: 'entrada' },
          { label: 'Salidas', value: 'salida' },
          { label: 'Ajustes', value: 'ajuste' },
          { label: 'Reservas', value: 'reserva' },
          { label: 'Liberaciones', value: 'liberacion' },
        ],
      },
      {
        name: 'fechaInicio',
        label: 'Desde',
        type: 'date',
        width: 155,
        maxDate: filterValues.fechaFin || undefined,
      },
      {
        name: 'fechaFin',
        label: 'Hasta',
        type: 'date',
        width: 155,
        minDate: filterValues.fechaInicio || undefined,
      },
    ],
    [filterValues.fechaInicio, filterValues.fechaFin]
  );

  return (
    <PlaceholderPage
      title="Movimientos de Inventario"
      description="Registra entradas, salidas, ajustes, reservas y liberaciones de stock. Las entradas generadas por recepción se anulan desde Recepción de mercadería."
    >
      <ErrorMessage message={error?.message || error} />

      {rangoFechasInvalido && (
        <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />
      )}

      <AdminResourceTable
        rows={rangoFechasInvalido ? [] : movements}
        columns={columns}
        actions={rowActions}
        loading={isLoading || isFetching}
        pagination={rangoFechasInvalido ? emptyPagination({ pageNumber, pageSize }) : pagination}
        searchValue={search}
        searchLabel="Buscar por producto, variante o notas..."
        onSearchChange={(val) => { setSearch(val); setPageNumber(1); }}
        filterValues={filterValues}
        filters={filtersConfig}
        onFilterChange={(name, val) => {
          setFilterValues((prev) => ({ ...prev, [name]: val }));
          setPageNumber(1);
        }}
        onResetFilters={() => {
          setSearch('');
          setFilterValues(getInitialMovementFilters());
          setPageNumber(1);
        }}
        onPageChange={(nuevaPagina) => setPageNumber(nuevaPagina)}
        onPageSizeChange={(nuevoSize) => { setPageSize(nuevoSize); setPageNumber(1); }}
        primaryActionLabel="Nuevo Movimiento"
        onPrimaryAction={() => setOpenRegistrarModal(true)}
        emptyTitle="No hay movimientos"
        emptyDescription="Aún no se ha realizado ninguna entrada, salida o ajuste en el sistema."
      />

      {openRegistrarModal && (
        <MovementForm
          open={openRegistrarModal}
          onClose={() => setOpenRegistrarModal(false)}
          onSubmit={registerMovement}
          isSubmitting={isRegistering}
        />
      )}

      <CancelMovementDialog
        open={Boolean(movimientoAnular)}
        movimiento={movimientoAnular}
        isCanceling={isCanceling}
        onClose={() => setMovimientoAnular(null)}
        onConfirm={cancelMovement}
      />

      <MovementDetailDialog
        open={Boolean(movimientoDetalle)}
        movimiento={movimientoDetalle}
        onClose={() => setMovimientoDetalle(null)}
      />
    </PlaceholderPage>
  );
};
