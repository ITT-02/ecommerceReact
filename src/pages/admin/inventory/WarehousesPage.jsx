// Página administrativa: Gestión de Almacenes.
import React, { useState } from 'react';
import {
  Container,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useWarehouses } from '../../../hooks/inventory/useWarehouses';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { StatusChip } from '../../../components/common/StatusChip';

import { WarehouseForm } from '../../../components/admin/WarehouseForm';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';

export const WarehousesPage = () => {
  const theme = useTheme();

  // ── Paginación y filtros ──────────────────────────────────────
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ esActivo: '' });


  // ── Hook ─────────────────────────────────────────────────────
  const {
    warehouses,
    pagination: _pagination,

    loading,
    fetching,
    error,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  } = useWarehouses({

    pageNumber,
    pageSize,
    search,
    esActivo: filters.esActivo === '' ? null : filters.esActivo === 'true',
  });

  // ── Estados de modales ────────────────────────────────────────
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [selectedDeleteWarehouse, setSelectedDeleteWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    es_activo: true,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Handlers de filtros/búsqueda ──────────────────────────────
  const handleSearchChange = (value) => {
    setSearch(value);
    setPageNumber(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({ esActivo: '' });
    setPageNumber(1);
  };


  // ── Handlers de formulario ────────────────────────────────────
  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', es_activo: true });
    setEditingWarehouse(null);
  };

const handleDialogClose = () => {
  document.activeElement?.blur();

  requestAnimationFrame(() => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedDeleteWarehouse(null);
    resetForm();
  });
};

  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleEditOpen = (warehouse) => {
    document.activeElement?.blur();
    setEditingWarehouse(warehouse);
    setFormData({
      nombre: warehouse.nombre || '',
      descripcion: warehouse.descripcion || '',
      es_activo: warehouse.es_activo ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteOpen = (warehouse) => {
    setSelectedDeleteWarehouse(warehouse);
    setDeleteDialogOpen(true);
  };

  // ── Handlers de acciones CRUD ─────────────────────────────────
  const handleCreateSubmit = async (data) => {
    setCreateLoading(true);
    try {
      await createWarehouse(data);
      handleDialogClose();
    } catch (err) {
      console.error('Error creando almacén:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateSubmit = async (data) => {
    setEditLoading(true);
    const warehouseId = editingWarehouse.id || editingWarehouse.codigo;
    try {
      await updateWarehouse(warehouseId, data);
      handleDialogClose();
    } catch (err) {
      console.error('Error actualizando almacén:', err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
document.activeElement?.blur(); setDeleteLoading(true);
    try {
      const warehouseId = selectedDeleteWarehouse.id || selectedDeleteWarehouse.codigo;
      await deleteWarehouse(warehouseId);
      handleDialogClose();
    } catch (err) {
      console.error('Error eliminando almacén:', err);
    } finally {
      setDeleteLoading(false);
    }
  };



  // ── Configuración de tabla ────────────────────────────────────
  const tableFilters = [

    {
      name: 'esActivo',
      label: 'Estado',
      type: 'select',
      width: 170,
      options: [
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' },
      ],
    },
  ];

  return (
    <PlaceholderPage title="Gestión de Almacenes" description="Administra los almacenes del sistema.">
       <ErrorMessage message={error} />

        <AdminResourceTable
          rows={(warehouses ?? []).map((w) => ({
            ...w,
            id: w.id ?? w.codigo,
          }))}
          columns={[
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
          ]}
          actions={[
            {
              type: 'edit',
              label: 'Editar',
              onClick: (row) => handleEditOpen(row),
            },
            {
              type: 'delete',
              label: 'Eliminar',
              onClick: (row) => handleDeleteOpen(row),
            },
          ]}
          loading={Boolean(loading)}
          pagination={_pagination}
          searchValue={search}
          searchLabel="Buscar almacén"
          filters={tableFilters}
          filterValues={filters}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageNumber(1);
          }}
          emptyTitle="No hay almacenes"
          emptyDescription="Aún no se han registrado almacenes."
          maxHeight={540}
          primaryActionLabel="Agregar Almacén"
          onPrimaryAction={handleCreateOpen}
        />

        {/* Modal: Crear */}
        <Dialog open={createDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth disableRestoreFocus>
          <DialogTitle>Agregar nuevo almacén</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <WarehouseForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreateSubmit}
                onCancel={handleDialogClose}
                isEditing={false}
                loading={createLoading}
              />
            </Box>
          </DialogContent>
        </Dialog>

        {/* Modal: Editar */}
        <Dialog open={editDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Editar almacén</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <WarehouseForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdateSubmit}
                onCancel={handleDialogClose}
                isEditing={true}
                loading={editLoading}
              />
            </Box>
          </DialogContent>
        </Dialog>

        {/* Modal: Confirmar eliminación */}
        <ConfirmDialog
          open={deleteDialogOpen}
          action="delete"
          title="Eliminar almacén"
          message={`¿Estás seguro de eliminar el almacén "${selectedDeleteWarehouse?.nombre}"? Esta acción no se puede deshacer.`}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDialogClose}
          confirmText="Eliminar"
          loading={deleteLoading}
        />
    </PlaceholderPage>
  );
};