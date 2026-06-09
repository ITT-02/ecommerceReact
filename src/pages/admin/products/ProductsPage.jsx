// Pagina administrativa: Productos.

import { useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { ProductForm } from '../../../components/admin/products/ProductForm';
import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import {
  formDataToProductPayload,
  initialProductFormData,
  productToFormData,
} from '../../../adapters/catalog/productAdapter';
import { useProducts } from '../../../hooks/catalog/useProducts';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useCustomizationOptions } from '../../../hooks/catalog/useCustomizationOptions';
import {
  getProductCustomizationOptions,
  saveProductCustomizationOptions,
} from '../../../services/catalog/customizationService';

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
    venderSinStock: '',
    origen: '',
  });
  const [confirm, setConfirm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pageNotice, setPageNotice] = useState('');
  const [formData, setFormData] = useState(initialProductFormData);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    options: customizationOptions,
    loading: loadingCustomizationOptions,
    error: customizationError,
  } = useCustomizationOptions({ onlyActive: true });

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
    deactivateProduct,
  } = useProducts({
    pageNumber,
    pageSize,
    search,
    categoriaId: filters.categoriaId || null,
    esActivo: toBooleanFilter(filters.esActivo),
    destacado: toBooleanFilter(filters.destacado),
    requiereCotizacion: toBooleanFilter(filters.requiereCotizacion),
    venderSinStock: toBooleanFilter(filters.venderSinStock),
    origen: filters.origen || null,
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
      venderSinStock: '',
      origen: '',
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
    setFormData(productToFormData(product));
    setEditingId(product.id);
    setIsFormOpen(true);
    setFormError('');
    setPageNotice('');

    try {
      setFormLoading(true);
      const productDetail = await getProductById(product.id);
      if (productDetail) {
        const productOptions = await getProductCustomizationOptions(product.id);
        setFormData({
          ...productToFormData(productDetail),
          personalizacion_opciones: productOptions,
        });
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
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
      const savedProduct = await saveProduct(productData, editingId);
      const savedProductId =
        editingId ||
        savedProduct?.producto?.id ||
        savedProduct?.id ||
        savedProduct?.[0]?.id;

      if (savedProductId) {
        await saveProductCustomizationOptions({
          productId: savedProductId,
          options: productData.es_personalizable ? productData.personalizacion_opciones : [],
        });
      }

      setPageNotice(editingId ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      resetForm();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;

    try {
      await deactivateProduct(confirm.product);
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
      field: 'origen_producto',
      headerName: 'Origen',
      width: 160,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.origen_producto === 'socio' ? 'Socio comercial' : 'Aliqora'}
          color={row.origen_producto === 'socio' ? 'secondary' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'socio_nombre',
      headerName: 'Socio',
      width: 190,
      emptyText: '-',
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
      field: 'vender_sin_stock',
      headerName: 'Disponibilidad',
      type: 'boolean',
      width: 155,
      trueLabel: 'Bajo pedido',
      falseLabel: 'Solo con stock',
      trueColor: 'warning',
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
      name: 'origen',
      label: 'Origen',
      type: 'select',
      width: 170,
      options: [
        { label: 'Aliqora', value: 'aliqora' },
        { label: 'Socio comercial', value: 'socio' },
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
    {
      name: 'venderSinStock',
      label: 'Disponibilidad',
      type: 'select',
      width: 190,
      options: [
        { label: 'Bajo pedido', value: 'true' },
        { label: 'Solo con stock', value: 'false' },
      ],
    },
  ];

  const actions = [
    {
      type: 'edit',
      label: 'Editar',
      onClick: handleEdit,
    },
    {
      type: 'deactivate',
      label: 'Retirar de tienda',
      onClick: (product) => setConfirm({ product }),
      visible: (product) => product.es_activo !== false,
    },
  ];

  return (
    <PlaceholderPage title="Productos" description="Administra productos base, categorias, estado comercial y visibilidad en tienda.">
      <Stack spacing={2}>
        <ErrorMessage message={error || customizationError} />

        {pageNotice && (
          <Alert severity="info" onClose={() => setPageNotice('')}>
            {pageNotice}
          </Alert>
        )}

        <Box>
          <AdminResourceTable
            rows={products}
            columns={columns}
            actions={actions}
            loading={loading || fetching}
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
        </Box>
      </Stack>

      <AdminDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Editar producto' : 'Nuevo producto'}
        icon={<Inventory2OutlinedIcon />}
        maxWidth="md"
        loading={saving || formLoading}
      >
        <ProductForm
          editingId={editingId}
          formData={formData}
          categories={categories}
          loading={saving || formLoading}
          error={formError}
          customizationOptions={customizationOptions}
          loadingCustomizationOptions={loadingCustomizationOptions}
          onCancel={handleCloseForm}
          onChange={handleInputChange}
          onMediaChange={handleFormFieldChange}
          onSubmit={handleSubmit}
        />
      </AdminDialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        action="delete"
        title="Retirar producto de tienda"
        message={`El producto "${confirm?.product?.nombre || ''}" dejará de mostrarse en la tienda, pero se conservará su historial, pedidos y trazabilidad del socio comercial.`}
        confirmText="Retirar"
        loading={deleting}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </PlaceholderPage>
  );
};
