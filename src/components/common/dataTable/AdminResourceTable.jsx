import { Stack } from '@mui/material';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTable } from './DataTable';

/**
 * Componente padre que une:
 * - barra de filtros
 * - tabla
 */
export const AdminResourceTable = ({
  rows,
  columns,
  actions,
  loading,
  pagination,
  searchValue,
  searchLabel,
  filterValues,
  filters,
  onSearchChange,
  onFilterChange,
  onResetFilters,
  onPageChange,
  onPageSizeChange,
  primaryActionLabel,
  onPrimaryAction,
  emptyTitle,
  emptyDescription,
  maxHeight,
}) => {
  return (
    <Stack spacing={1.25}>
      <DataTableToolbar
        searchValue={searchValue}
        searchLabel={searchLabel}
        filters={filters}
        filterValues={filterValues}
        onSearchChange={onSearchChange}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        primaryActionLabel={primaryActionLabel}
        onPrimaryAction={onPrimaryAction}
      />

      <DataTable
        rows={rows}
        columns={columns}
        actions={actions}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        maxHeight={maxHeight}
      />
    </Stack>
  );
};