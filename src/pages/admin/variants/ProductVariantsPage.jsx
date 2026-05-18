// Página administrativa: Variantes.
import { useState, useMemo } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { useVariants } from '../../../hooks/catalog/useVariants';
import { formatCurrency } from '../../../utils/formatters';
import { VariantFormModal } from '../../../components/admin/variants/VariantFormModal';
import { getVariantById } from '../../../services/catalog/variantService';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

export const ProductVariantsPage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({ esActiva: '' });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState(null);

  // Sencillo debouncer para no golpear la base de datos con cada tecla.
  useMemo(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset pagination on search change
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Convertir string de filtro a booleano o null para el hook
  const isActiveFilter = filters.esActiva === 'true' ? true : filters.esActiva === 'false' ? false : null;

  const { variants, totalPages, totalRecords, loading, error, saveVariant, deactivateVariant, removeVariant } = useVariants({
    page,
    limit: pageSize,
    search: debouncedSearch,
    isActive: isActiveFilter
  });

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handlePageChange = (e, newPage) => setPage(newPage);

  const handleOpenModal = async (variantRow = null) => {
    document.activeElement?.blur();
    if (variantRow) {
      // Necesitamos los detalles completos (con los atributos dinámicos que tiene actualmente)
      try {
        const fullVariant = await getVariantById(variantRow.id || variantRow.variante_id);
        setSelectedVariant(fullVariant);
      } catch (err) {
        console.error("Error al obtener la variante completa:", err);
        return;
      }
    } else {
      setSelectedVariant(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVariant(null);
  };

  const handleSaveVariant = async (payload) => {
    try {
      await saveVariant(payload, selectedVariant?.id || selectedVariant?.variante_id);
      handleCloseModal();
    } catch (error) {
      console.error("Error saving variant:", error);
      alert("Hubo un error al guardar la variante.");
    }
  };

  const handleDeactivate = async (variantId) => {
    if (window.confirm('¿Estás seguro que deseas desactivar esta variante? Aún existirá pero no estará disponible para venta ni mostrarse en producto.')) {
      try {
        await deactivateVariant(variantId);
      } catch (err) {
        alert("Hubo un error al desactivar la variante.");
      }
    }
  };

  const handleDeleteRequest = (row) => {
    setVariantToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!variantToDelete) return;
    try {
      await removeVariant(variantToDelete.id || variantToDelete.variante_id);
    } catch (err) {
      alert("Hubo un error eliminando la variante. Posiblemente existan entidades atadas a ella.");
    } finally {
      setDeleteDialogOpen(false);
      setVariantToDelete(null);
    }
  };

  const columns = [
    {
      field: 'producto_nombre',
      headerName: 'Producto',
      width: 200,
      renderCell: (row) => row.producto_nombre || 'Sin producto'
    },
    {
      field: 'nombre_variante',
      headerName: 'Variante',
      width: 200,
      renderCell: (row) => row.nombre_variante || row.codigo_referencia || '-'
    },
    {
      field: 'atributos_resumen',
      headerName: 'Atributos',
      width: 320,
      renderCell: (row) => {
        if (!row.atributos_resumen || row.atributos_resumen === 'Sin atributos') {
          return <Typography variant="body2" color="text.secondary" fontStyle="italic">Sin atributos</Typography>;
        }
        
        // Separamos por el punto medio que viene de la base de datos " · "
        const parts = row.atributos_resumen.split(' · ');
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, py: 1 }}>
            {parts.map((part, index) => {
              const splitIdx = part.indexOf(': ');
              if (splitIdx > -1) {
                const attrName = part.slice(0, splitIdx);
                const attrVal = part.slice(splitIdx + 2);
                return (
                  <Box 
                    key={index}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1,
                      py: 0.3,
                      borderRadius: 1.5,
                      backgroundColor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      fontSize: '0.75rem',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5 }}>
                      {attrName}:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {attrVal}
                    </Typography>
                  </Box>
                );
              }
              return (
                <Box
                  key={index}
                  sx={{
                    px: 1, py: 0.3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', fontSize: '0.75rem'
                  }}
                >
                  {part}
                </Box>
              );
            })}
          </Box>
        );
      }
    },
    {
      field: 'medida',
      headerName: 'Medida',
      width: 120,
      renderCell: (row) => row.medida || row.etiqueta_medida || '-'
    },
    {
      field: 'precio',
      headerName: 'Precio',
      type: 'currency',
      width: 120,
    },
    {
      field: 'stock_minimo',
      headerName: 'Stock Mín.',
      width: 120,
      renderCell: (row) => row.stock_minimo ?? 0
    },
    {
      field: 'es_activa',
      headerName: 'Estado',
      type: 'boolean',
      trueLabel: 'Activo',
      falseLabel: 'Inactivo',
      width: 120,
    }
  ];

  const actions = [
    {
      type: 'edit',
      label: 'Editar',
      onClick: (row) => handleOpenModal(row)
    },
    {
      type: 'delete',
      label: 'Eliminar definitivamente',
      onClick: handleDeleteRequest
    }
  ];

  const tableFilters = [
    {
      name: 'esActiva',
      label: 'Estado',
      type: 'select',
      width: 170,
      options: [
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' },
      ],
    },
  ];

  // Configuración para que el componente maneje la paginación a través del backend
  const paginationConfig = {
    pageNumber: page,
    pageSize: pageSize,
    totalPages,
    totalCount: totalRecords,
  };

  return (
    <PlaceholderPage 
      title="Variantes de Productos" 
      description="Gestiona las variantes, sus características, medidas y precios asociados a un producto."
    >
        <ErrorMessage message={error?.message || (error ? 'Error al cargar datos.' : null)} />

        <AdminResourceTable
          rows={variants}
          columns={columns}
          actions={actions}
          loading={loading}
          pagination={paginationConfig}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          searchValue={search}
          searchLabel="Buscar por código, variante o producto..."
          filters={tableFilters}
          filterValues={filters}
          onSearchChange={setSearch}
          onFilterChange={(name, val) => {
            setFilters((prev) => ({ ...prev, [name]: val }));
            setPage(1); // Reiniciar página al filtrar
          }}
          onResetFilters={() => {
            setSearch('');
            setFilters({ esActiva: '' });
            setPage(1);
          }}
          primaryActionLabel="Nueva Variante"
          onPrimaryAction={() => handleOpenModal()}
          emptyTitle="No se encontraron variantes"
          emptyDescription="Intenta ajustar tus filtros o agregar una nueva."
          maxHeight={600}
        />
      
      
      {/* Modal para Crear/Editar Variant */}
      <VariantFormModal
        open={isModalOpen}
        variant={selectedVariant}
        onClose={handleCloseModal}
        onSave={handleSaveVariant}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        action="delete"
        title="¿Eliminar definitivamente?"
        message={`¿Estás seguro de que deseas eliminar permanentemente la variante "${variantToDelete?.nombre_variante || variantToDelete?.codigo_referencia || 'seleccionada'}"? Esta acción no se puede deshacer.`}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
      />
    </PlaceholderPage>
  );
};
