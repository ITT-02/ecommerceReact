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
  CircularProgress,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useQueryClient } from '@tanstack/react-query';
import { useWarehouses } from '../../../hooks/inventory/useWarehouses';
import { WarehouseTable } from '../../../components/admin/WarehouseTable';
import { WarehouseForm } from '../../../components/admin/WarehouseForm';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingScreen } from '../../../components/common/LoadingScreen';
import { ErrorMessage } from '../../../components/common/ErrorMessage';


export const WarehousesPage = () => {
  const queryClient = useQueryClient();
  const {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deactivateWarehouse,
    deleteWarehouse,
  } = useWarehouses();

  // Modal states
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

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      es_activo: true,
    });
    setEditingWarehouse(null);
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

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedDeleteWarehouse(null);
    resetForm();
  };

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

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  const handleDeactivate = async (warehouse) => {
    const warehouseId = warehouse.id || warehouse.codigo;
    try {
      await deactivateWarehouse(warehouseId);
    } catch (err) {
      console.error('Error desactivando almacén:', err);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando almacenes..." />;
  }

  const theme = useTheme();

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>

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
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }} >Agregar almacén</Box>
            <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }} >+ Almacén</Box>
          </Button>
      </Box>


      <ErrorMessage message={error} />

      <WarehouseTable

        warehouses={warehouses}
        onEdit={handleEditOpen}
        onDeactivate={handleDeactivate}
        onDelete={handleDeleteOpen}
      />

      {/* Create Modal */}
      <Dialog open={createDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar nuevo almacén</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <WarehouseForm
              formData={formData}
              setFormData={handleFormChange}
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

      {/* Edit Modal */}
      <Dialog open={editDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar almacén</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <WarehouseForm
              formData={formData}
              setFormData={handleFormChange}
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

      {/* Delete Confirm Dialog */}
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
