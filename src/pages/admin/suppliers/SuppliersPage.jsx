// Página administrativa: Proveedores.
// Centraliza proveedores, datos de contacto y costos de compra por variante.

import { useState } from 'react';
import { Alert, Chip, Stack } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useProcurementOptions, useSuppliersAdmin } from '../../../hooks/procurement/useProcurement';
import { normalizeApiError } from '../../../utils/api/normalizeApiError';
import { SupplierDialog } from './components/SupplierDialog';
import { SupplierProductsDialog } from './components/SupplierProductsDialog';

const ACTIVE_OPTIONS = [
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
];

const toBooleanFilter = (value) => {
  if (value === '') return null;
  return value === 'true';
};

export const SuppliersPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ es_activo: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const { variantes } = useProcurementOptions('');

  const {
    rows,
    pagination,
    loading,
    fetching,
    saving,
    error,
    saveSupplier,
    saveSupplierProducts,
  } = useSuppliersAdmin({
    pageNumber,
    pageSize,
    search,
    isActive: toBooleanFilter(filters.es_activo),
  });

  const handleOpenForm = (supplier = null) => {
    setSelectedSupplier(supplier);
    setFormError('');
    setFormOpen(true);
  };

  const handleSaveSupplier = async (payload) => {
    setFormError('');

    try {
      await saveSupplier(payload);
      setFormError('');
      setNotice(payload.id ? 'Proveedor actualizado correctamente.' : 'Proveedor registrado correctamente.');
      setFormOpen(false);
      setSelectedSupplier(null);
    } catch (err) {
      setFormError(normalizeApiError(err) || 'No se pudo guardar el proveedor.');
    }
  };

  const handleDeactivate = async (supplier) => {
    setFormError('');

    try {
      await saveSupplier({ ...supplier, es_activo: false });
      setFormError('');
      setNotice('Proveedor desactivado correctamente.');
    } catch (err) {
      setFormError(normalizeApiError(err) || 'No se pudo desactivar el proveedor.');
    }
  };

  const handleSaveSupplierProducts = async (payload) => {
    setFormError('');

    try {
      await saveSupplierProducts(payload);
      setFormError('');
      setNotice('Costos por proveedor actualizados correctamente.');
    } catch (err) {
      setFormError(normalizeApiError(err) || 'No se pudieron guardar los productos del proveedor.');
      throw err;
    }
  };

  return (
    <PlaceholderPage
      title="Proveedores"
      description="Registra proveedores, costos de compra, tiempos de abastecimiento y relación con variantes."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || formError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

        <AdminResourceTable
          rows={rows}
          columns={[
            { field: 'ruc', headerName: 'RUC', width: 120, emptyText: '-' },
            { field: 'razon_social', headerName: 'Proveedor', width: 230 },
            { field: 'nombre_comercial', headerName: 'Nombre comercial', width: 180, emptyText: '-' },
            { field: 'contacto', headerName: 'Contacto', width: 160, emptyText: '-' },
            { field: 'telefono', headerName: 'Teléfono', width: 140, emptyText: '-' },
            { field: 'correo', headerName: 'Correo', width: 210, emptyText: '-' },
            {
              field: 'productos_asociados',
              headerName: 'Costos definidos',
              width: 140,
              renderCell: (row) => (
                <Chip size="small" label={`${row.productos_asociados || 0} productos`} variant="outlined" color="info" />
              ),
            },
            { field: 'es_activo', headerName: 'Estado', width: 110, type: 'boolean' },
          ]}
          actions={[
            { type: 'edit', label: 'Editar proveedor', onClick: (row) => handleOpenForm(row) },
            {
              type: 'products',
              label: 'Productos y costos',
              icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} />,
              onClick: (row) => {
                setSelectedSupplier(row);
                setFormError('');
                setProductsOpen(true);
              },
            },
            {
              type: 'deactivate',
              label: 'Desactivar',
              visible: (row) => row.es_activo,
              onClick: handleDeactivate,
            },
          ]}
          loading={loading || fetching || saving}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar proveedor"
          filters={[{ name: 'es_activo', label: 'Estado', type: 'select', width: 160, options: ACTIVE_OPTIONS }]}
          filterValues={filters}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            setFilters((current) => ({ ...current, [name]: value }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setSearch('');
            setFilters({ es_activo: '' });
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          primaryActionLabel="Agregar proveedor"
          onPrimaryAction={() => handleOpenForm(null)}
          emptyTitle="Sin proveedores"
          emptyDescription="Agrega proveedores para abastecimiento, compras y productos bajo pedido."
          maxHeight={560}
        />
      </Stack>

      {formOpen && (
        <SupplierDialog
        key={selectedSupplier?.id || 'nuevo-proveedor'}
        open={formOpen}
        supplier={selectedSupplier}
        saving={saving}
        error={formError}
        onClose={() => {
          setFormOpen(false);
          setFormError('');
        }}
        onSubmit={handleSaveSupplier}
      />
      )}

      {productsOpen && (
        <SupplierProductsDialog
        key={selectedSupplier?.id || 'productos-proveedor'}
        open={productsOpen}
        supplier={selectedSupplier}
        variants={variantes}
        saving={saving}
        saveError={formError}
        onClose={() => {
          setProductsOpen(false);
          setFormError('');
        }}
        onSubmit={handleSaveSupplierProducts}
      />
      )}
    </PlaceholderPage>
  );
};
