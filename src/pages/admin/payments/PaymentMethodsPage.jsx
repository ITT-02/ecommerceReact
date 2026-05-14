// Página administrativa: Métodos de pago.

import { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';

import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';

import { PaymentMethodFormDialog } from '../../../components/admin/payments/PaymentMethodFormDialog';
import { usePaymentMethods, usePaymentMethodsMutations } from '../../../hooks/sales/usePaymentMethods';

export const PaymentMethodsPage = () => {
  const { data: paymentMethods = [], isLoading, error } = usePaymentMethods();
  const { createMethod, updateMethod, deleteMethod, isCreating, isUpdating, isDeleting } = usePaymentMethodsMutations();

  const [formOpen, setFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  const [methodToModify, setMethodToModify] = useState(null);

  // States para modal de Eliminar Físicamente
  const [hardDeleteDialogOpen, setHardDeleteDialogOpen] = useState(false);

  // States para AdminResourceTable
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ esActivo: '' });

  // Manejo del formulario
  const handleOpenForm = (method = null) => {
    setEditingMethod(method);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingMethod(null);
    setFormOpen(false);
  };

  const handleSubmitForm = async (payload) => {
    try {
      if (editingMethod) {
        await updateMethod({ id: editingMethod.id, payload });
      } else {
        await createMethod(payload);
      }
      handleCloseForm();
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  // Manejo de eliminación definitiva
  const handleHardDeleteRequest = (method) => {
    setMethodToModify(method);
    setHardDeleteDialogOpen(true);
  };

  const handleConfirmHardDelete = async () => {
    try {
      if (methodToModify) {
        await deleteMethod(methodToModify.id);
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
    } finally {
      setHardDeleteDialogOpen(false);
      setMethodToModify(null);
    }
  };

  // Configuración de la Tabla (AdminResourceTable)
  const columns = [
    { field: 'orden_visual', headerName: 'Orden', width: 90 },
    { 
      field: 'imagen_url', 
      headerName: 'Imagen', 
      width: 100,
      renderCell: (row) => (
        row.imagen_url ? (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <img src={row.imagen_url} alt={row.nombre} style={{ maxHeight: '30px', maxWidth: '60px', objectFit: 'contain' }} />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">-</Typography>
        )
      )
    },
    { field: 'codigo', headerName: 'Código', width: 140 },
    { field: 'nombre', headerName: 'Nombre', width: 220 },
    { 
      field: 'tipo', 
      headerName: 'Tipo', 
      width: 170, 
      renderCell: (row) => (
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {row.tipo.replace('_', ' ')}
        </Typography>
      )
    },
    {
      field: 'es_activo',
      headerName: 'Estado',
      width: 120,
      type: 'boolean',
      trueLabel: 'Activo',
      falseLabel: 'Inactivo',
    },
  ];

  const actions = [
    {
      type: 'edit',
      label: 'Editar',
      onClick: handleOpenForm,
    },
    {
      type: 'delete',
      label: 'Eliminar definitivamente',
      onClick: handleHardDeleteRequest,
    },
  ];

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

  // Filtreo local de los datos (ya que usamos select * sin paginación desde el hook básico)
  const filteredRows = paymentMethods.filter((row) => {
    let match = true;
    
    if (search) {
      const q = search.toLowerCase();
      const code = (row.codigo || '').toLowerCase();
      const name = (row.nombre || '').toLowerCase();
      if (!code.includes(q) && !name.includes(q)) match = false;
    }
    
    if (filters.esActivo !== '') {
      const isActive = filters.esActivo === 'true';
      if (row.es_activo !== isActive) match = false;
    }

    return match;
  });

  return (
    <PlaceholderPage 
      title="Métodos de Pago" 
      description="Configura y gestiona métodos de pago disponibles para el checkout y administración."
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          width: '100%',
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 1.5, md: 2.5 },
        }}
      >
        <ErrorMessage message={error?.message} />

        <AdminResourceTable
          rows={filteredRows}
          columns={columns}
          actions={actions}
          loading={isLoading}
          searchValue={search}
          searchLabel="Buscar método..."
          filters={tableFilters}
          filterValues={filters}
          onSearchChange={setSearch}
          onFilterChange={(name, val) => setFilters((prev) => ({ ...prev, [name]: val }))}
          onResetFilters={() => {
            setSearch('');
            setFilters({ esActivo: '' });
          }}
          primaryActionLabel="Agregar método"
          onPrimaryAction={() => handleOpenForm()}
          emptyTitle="No se encontraron métodos"
          emptyDescription="Intenta ajustar tus filtros o agregar uno nuevo."
          maxHeight={500}
        />
      </Container>

      <PaymentMethodFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialData={editingMethod}
        isSubmitting={isCreating || isUpdating}
      />

      <ConfirmDialog
        open={hardDeleteDialogOpen}
        action="delete"
        title="¿Eliminar definitivamente?"
        message={`¿Estás seguro de que deseas eliminar permanentemente "${methodToModify?.nombre}"? Usa esta opción solo si el método fue creado por error y NUNCA se ha usado en un pedido, de lo contrario esto romperá el historial.`}
        onCancel={() => setHardDeleteDialogOpen(false)}
        onConfirm={handleConfirmHardDelete}
        confirmText="Eliminar"
        loading={isDeleting}
      />
    </PlaceholderPage>
  );
};