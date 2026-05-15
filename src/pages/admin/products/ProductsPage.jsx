// Pagina administrativa: Productos.

import { useState } from 'react';
import {
  Alert,
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { ProductForm } from '../../../components/admin/products/ProductForm';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';

import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  formDataToProductPayload,
  initialProductFormData,
  productToFormData,
} from '../../../adapters/catalog/productAdapter';
import { useProducts } from '../../../hooks/catalog/useProducts';

const toBooleanFilter = (value) => {
  if (value === '') return null;
  return value === 'true';
};

export const ProductsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    categoriaId: '',
    esActivo: '',
    destacado: '',
    requiereCotizacion: '',
  });
  const [confirm, setConfirm] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pageNotice, setPageNotice] = useState('');
  const [formData, setFormData] = useState(initialProductFormData);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    products,
    categories,
    pagination,
    loading,
    fetching,
    error,
    saving,
    deleting,
    getProductById,
    saveProduct,
    removeProduct,
  } = useProducts({
    pageNumber,
    pageSize,
    search,
    categoriaId: filters.categoriaId || null,
    esActivo: toBooleanFilter(filters.esActivo),
    destacado: toBooleanFilter(filters.destacado),
    requiereCotizacion: toBooleanFilter(filters.requiereCotizacion),
  });

  
  const handleSearchChange = (value) => {
    setSearch(value);
    setPageNotice('');
    setPageNumber(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPageNotice('');
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({
      categoriaId: '',
      esActivo: '',
      destacado: '',
      requiereCotizacion: '',
    });
    setPageNotice('');
    setPageNumber(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPageNumber(1);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormError('');
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormFieldChange = (name, value) => {
    setFormError('');
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialProductFormData);
    setEditingId(null);
    setIsFormOpen(false);
    setFormError('');
  };

  const handleCloseForm = () => {
    if (saving) return;
    resetForm();
  };

  const handleEdit = async (product) => {
    try {
      setDetailLoading(true);
      const productDetail = await getProductById(product.id);
      setFormData(productToFormData(productDetail || product));
      setEditingId(product.id);
      setIsFormOpen(true);
      setFormError('');
      setPageNotice('');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData(initialProductFormData);
    setEditingId(null);
    setIsFormOpen(true);
    setFormError('');
    setPageNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.nombre.trim()) {
      setFormError('El nombre del producto es obligatorio.');
      return;
    }

    if (!formData.categoria_id) {
      setFormError('Selecciona una categoria para el producto.');
      return;
    }

    try {
      const productData = formDataToProductPayload(formData);
      await saveProduct(productData, editingId);
      setPageNotice(editingId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      resetForm();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;

    try {
      await removeProduct(confirm.product);
    } finally {
      setConfirm(null);
    }
  };

  const categoryOptions = categories.map((category) => ({
    label: category.nombre,
    value: category.id,
  }));

  const columns = [
    {
      field: 'imagen_principal_url',
      headerName: 'Imagen',
      type: 'image',
      altField: 'nombre',
      imageSize: 48,
      width: 88,
    },
    {
      field: 'nombre',
      headerName: 'Producto',
      width: 240,
      emptyText: 'Sin nombre',
    },
    {
      field: 'categoria_nombre',
      headerName: 'Categoria',
      width: 190,
      emptyText: 'Sin categoria',
    },
    {
      field: 'descripcion_corta',
      headerName: 'Descripcion corta',
      width: 280,
      emptyText: 'Sin descripcion',
    },
    {
      field: 'destacado',
      headerName: 'Destacado',
      type: 'boolean',
      width: 130,
      trueLabel: 'Si',
      falseLabel: 'No',
      falseColor: 'default',
    },
    {
      field: 'es_personalizable',
      headerName: 'Personalizable',
      type: 'boolean',
      width: 150,
      trueLabel: 'Si',
      falseLabel: 'No',
      falseColor: 'default',
    },
    {
      field: 'requiere_cotizacion',
      headerName: 'Cotizacion',
      type: 'boolean',
      width: 135,
      trueLabel: 'Requiere',
      falseLabel: 'No',
      falseColor: 'default',
    },
    {
      field: 'es_activo',
      headerName: 'Estado',
      type: 'boolean',
      width: 125,
      trueLabel: 'Activo',
      falseLabel: 'Inactivo',
    },
  ];

  const tableFilters = [
    {
      name: 'categoriaId',
      label: 'Categoria',
      type: 'select',
      width: 190,
      options: categoryOptions,
    },
    {
      name: 'esActivo',
      label: 'Estado',
      type: 'select',
      width: 150,
      options: [
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' },
      ],
    },
    {
      name: 'destacado',
      label: 'Destacado',
      type: 'select',
      width: 155,
      options: [
        { label: 'Destacados', value: 'true' },
        { label: 'No destacados', value: 'false' },
      ],
    },
    {
      name: 'requiereCotizacion',
      label: 'Cotizacion',
      type: 'select',
      width: 175,
      options: [
        { label: 'Requiere', value: 'true' },
        { label: 'No requiere', value: 'false' },
      ],
    },
  ];

  const actions = [
    {
      type: 'edit',
      label: 'Editar',
      disabled: () => detailLoading,
      onClick: handleEdit,
    },
    {
      type: 'delete',
      label: 'Eliminar',
      onClick: (product) => setConfirm({ product }),
    },
  ];

  return (
    
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          
        <PlaceholderPage
          title="Productos"
          description="Gestiona los productos visibles en la pagina principal de la tienda."
          >
      <ErrorMessage message={error} />

      {pageNotice && (
        <Alert severity="info" onClose={() => setPageNotice('')}>
          {pageNotice}
        </Alert>
      )}

      <AdminResourceTable
        rows={products}
        columns={columns}
        actions={actions}
        loading={loading || fetching || detailLoading}
        pagination={pagination}
        searchValue={search}
        searchLabel="Buscar producto"
        filters={tableFilters}
        filterValues={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onPageChange={setPageNumber}
        onPageSizeChange={handlePageSizeChange}
        primaryActionLabel="Nuevo producto"
        onPrimaryAction={handleCreate}
        emptyTitle="No hay productos"
        emptyDescription="Intenta ajustar la busqueda, cambiar filtros o crear un nuevo producto."
        maxHeight={560}
      />
    </PlaceholderPage>


      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="md"
        scroll="paper"
        disableRestoreFocus
        slotProps={{
          paper: {
            sx: {
              position: 'relative',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
            },
          },
        }}
      >
        <IconButton
          onClick={handleCloseForm}
          disabled={saving}
          size="small"
          aria-label="Cerrar formulario"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            color: 'text.secondary',
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>

        <DialogTitle sx={{ pr: 6 }}>
          {editingId ? 'Editar producto' : 'Nuevo producto'}
          <Typography variant="body2" color="text.secondary">
            Completa la informacion base, configuracion comercial y multimedia del producto.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <ProductForm
            editingId={editingId}
            formData={formData}
            categories={categories}
            loading={saving}
            error={formError}
            onCancel={handleCloseForm}
            onChange={handleInputChange}
            onMediaChange={handleFormFieldChange}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        action="delete"
        title="Eliminar producto"
        message={`Esta accion eliminara el producto "${confirm?.product?.nombre || ''}" de forma permanente.`}
        loading={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </Container>
  );
};
