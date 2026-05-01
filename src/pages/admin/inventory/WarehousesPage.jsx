// Página administrativa: Gestión de Almacenes.

import React, { useState } from 'react';
import { Container, Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useQueryClient } from '@tanstack/react-query';
import { useWarehouses } from '../../../hooks/inventory/useWarehouses';
import { WarehouseTable } from '../../../components/admin/WarehouseTable';
import { WarehouseForm } from '../../../components/admin/WarehouseForm';
import { PageHeader } from '../../../components/common/PageHeader';
import { LoadingScreen } from '../../../components/common/LoadingScreen';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { colors } from '../../../styles/theme';

export const WarehousesPage = () => {
  const queryClient = useQueryClient();
  const {
    warehouses,
    loading,
    error,
    createWarehouse,
    updateWarehouse,
    deactivateWarehouse,
  } = useWarehouses();

  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    es_activo: true,
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      es_activo: true,
    });
    setEditingWarehouse(null);
    setShowForm(false);
  };

  const handleCreate = async (data) => {
    try {
      await createWarehouse(data);
      resetForm();
    } catch (err) {
      console.error('Error creando almacén:', err);
    }
  };

  const handleUpdate = async (data) => {
    const warehouseId = editingWarehouse.id || editingWarehouse.codigo;
    console.log('Intentando actualizar almacén:', { editingWarehouse, data, warehouseId });
    try {
      const result = await updateWarehouse(warehouseId, data);
      console.log('Resultado de updateWarehouse:', result);
      resetForm();
      console.log('Actualización completada, regresando a gestión de almacenes');
    } catch (err) {
      console.error('Error actualizando almacén:', err);
    }
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({
      nombre: warehouse.nombre || '',
      descripcion: warehouse.descripcion || '',
      es_activo: warehouse.es_activo ?? true,
    });
    setShowForm(true);
  };

  const handleDeactivate = async (warehouse) => {
    const warehouseId = warehouse.id || warehouse.codigo;
    console.log('Intentando desactivar almacén:', { warehouse, warehouseId });
    try {
      await deactivateWarehouse(warehouseId);
    } catch (err) {
      console.error('Error desactivando almacén:', err);
    }
  };

  const handleChange = (newData) => {
    setFormData(newData);
  };

  if (loading) {
    return <LoadingScreen message="Cargando almacenes..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: colors.neutral[50], minHeight: '100vh' }}>
      {!showForm && (
        <PageHeader
          title="Gestión de Almacenes"
          description="Administra los almacenes del sistema."
          action={
            <Button
              variant="contained"
              onClick={() => setShowForm(true)}
              sx={{ backgroundColor: colors.primary[600], '&:hover': { backgroundColor: colors.primary[700] } }}
            >
              Agregar almacén
            </Button>
          }
        />
      )}

      <ErrorMessage message={error} />

      {showForm ? (
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={resetForm}
            sx={{ mb: 3, color: colors.primary[700], '&:hover': { backgroundColor: colors.neutral[100] } }}
          >
            Volver a almacenes
          </Button>
          <WarehouseForm
            formData={formData}
            setFormData={handleChange}
            onSubmit={editingWarehouse ? handleUpdate : handleCreate}
            onCancel={resetForm}
            isEditing={!!editingWarehouse}
          />
        </Box>
      ) : (
        <WarehouseTable
          warehouses={warehouses}
          onEdit={handleEdit}
          onDeactivate={handleDeactivate}
        />
      )}
    </Container>
  );
};
