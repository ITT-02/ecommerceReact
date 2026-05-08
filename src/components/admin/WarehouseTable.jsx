// Tabla para mostrar almacenes (reutiliza componente común de tabla/paginación)

import React from 'react';

import { AdminResourceTable } from '../common/dataTable/AdminResourceTable';
import { StatusChip } from '../common/StatusChip';

// onDeactivate no se usa porque se eliminaron las acciones de cambio de estado
// en la vista de almacenes (mantener la prop para compatibilidad con el componente base).

const sanitizeWarehouseSearch = (value = '') => {
  // Solo permite letras/números y espacios (incluye acentos básicos)
  return String(value)
    .replace(/[^a-zA-Z0-9À-ÿ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart();
};

export const WarehouseTable = ({
  warehouses,
  searchValue,
  filterValues,
  filters,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  onEdit,

  onDelete,
  pagination,
  onPageChange,
  onPageSizeChange,
  loading,
}) => {
  const rows = (warehouses ?? []).map((w) => ({
    ...w,
    id: w.id ?? w.codigo,
  }));

  const columns = [
    {
      field: 'codigo',
      headerName: 'Código',
      width: 140,
      minWidth: 130,
    },
    {
      field: 'nombre',
      headerName: 'Nombre',
      width: 220,
      minWidth: 190,
    },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      width: 260,
      minWidth: 220,
      renderCell: (row) => row.descripcion || '-',
    },
    {
      field: 'es_activo',
      headerName: 'Estado',
      width: 140,
      minWidth: 140,
      renderCell: (row) => (
        <StatusChip
          label={row.es_activo ? 'Activo' : 'Inactivo'}
          color={row.es_activo ? 'success' : 'error'}
        />
      ),
    },
  ];

  const actions = [
    {
      type: 'edit',
      label: 'Editar',
      onClick: (row) => onEdit?.(row),
      disabled: () => !onEdit,
    },
    {
      type: 'delete',
      label: 'Eliminar',
      onClick: (row) => onDelete?.(row),
      disabled: () => !onDelete,
    },
  ].filter((a) => {
    // Eliminar acciones que no aplican para evitar “Acciones” vacías
    if (a.type === 'edit') return Boolean(onEdit);
    if (a.type === 'delete') return Boolean(onDelete);
    return true;
  });

  return (
    <AdminResourceTable
      rows={rows}
      columns={columns}
      actions={actions}
      loading={Boolean(loading)}
      pagination={pagination}
      searchValue={searchValue}
      searchLabel="Buscar almacén"
      filters={filters ?? []}
      filterValues={filterValues ?? {}}
      onSearchChange={(value) => onSearchChange?.(sanitizeWarehouseSearch(value))}
      onFilterChange={onFilterChange}
      onResetFilters={onResetFilters}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyTitle="No hay almacenes"
      emptyDescription="Aún no se han registrado almacenes."
      maxHeight={540}
      primaryActionLabel={undefined}
      onPrimaryAction={undefined}
    />
  );
};

