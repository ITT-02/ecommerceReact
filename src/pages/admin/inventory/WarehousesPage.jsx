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
import { WarehouseTable } from '../../../components/admin/WarehouseTable';
import { WarehouseForm } from '../../../components/admin/WarehouseForm';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { PageHeader } from '../../../components/common/PageHeader';
import { ErrorMessage } from '../../../components/common/ErrorMessage';

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
    pagination,
    loading,
    fetching,
    error,
    createWarehouse,
    updateWarehouse,
    deactivateWarehouse,
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
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedDeleteWarehouse(null);
    resetForm();
  };

  const handleCreateOpen = () => {
    resetForm();
    setCreateDialogOpen(true);
  };

  const handleEditOpen = (warehouse) => {
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
    setDeleteLoading(true);
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

  const handleDeactivate = async (warehouse) => {
    const warehouseId = warehouse.id || warehouse.codigo;
    try {
      await deactivateWarehouse(warehouseId);
    } catch (err) {
      console.error('Error desactivando almacén:', err);
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
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      <PageHeader
        title="Gestión de Almacenes"
        description="Administra los almacenes del sistema."
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          onClick={handleCreateOpen}
          sx={{
            '&:hover': { backgroundColor: theme.palette.primary.dark },
            minWidth: 140,
            [theme.breakpoints.down('sm')]: {
              minWidth: 'auto',
              padding: '8px 12px',
            },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Agregar almacén
          </Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
            + Almacén
          </Box>
        </Button>
      </Box>

      <ErrorMessage message={error} />

      <WarehouseTable
        warehouses={warehouses}
        loading={loading}
        fetching={fetching}
        pagination={pagination}
        searchValue={search}
        filters={tableFilters}
        filterValues={filters}
        onEdit={handleEditOpen}
        onDeactivate={handleDeactivate}
        onDelete={handleDeleteOpen}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onPageChange={setPageNumber}
        onPageSizeChange={setPageSize}
      />

      {/* Modal: Crear */}
      <Dialog open={createDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
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
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={createLoading}>
            Cancelar
          </Button>
        </DialogActions>
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
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={editLoading}>
            Cancelar
          </Button>
        </DialogActions>
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
    </Container>
  );
};