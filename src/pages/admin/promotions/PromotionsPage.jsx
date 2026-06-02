// Página administrativa: Promociones.
import { useState } from 'react';
import { Chip } from '@mui/material';

import { PromotionDetailDialog } from '../../../components/admin/promotions/PromotionDetailDialog';
import { PromotionFormDialog } from '../../../components/admin/promotions/PromotionFormDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { usePromotions } from '../../../hooks/marketing/usePromotions';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { normalizeApiError } from '../../../utils/api/normalizeApiError';

const toBooleanFilter = (value) => {
  if (value === '') return null;
  return value === 'true';
};

const promotionStatusConfig = {
  vigente: { label: 'Vigente', color: 'success' },
  programada: { label: 'Programada', color: 'info' },
  vencida: { label: 'Vencida', color: 'warning' },
  inactiva: { label: 'Inactiva', color: 'error' },
};

const getPromotionStatusConfig = (status) => {
  return promotionStatusConfig[status] || {
    label: status || 'Sin estado',
    color: 'default',
  };
};

const promotionTypeLabel = {
  descuento_directo: 'Descuento directo',
  cupon: 'Cupón',
  envio_gratis: 'Envío gratis',
};

const discountTypeLabel = {
  porcentaje: 'Porcentaje',
  monto_fijo: 'Monto fijo',
  envio_gratis: 'Envío gratis',
};

const appliesToLabel = {
  todos: 'Todo el catálogo',
  categoria: 'Categoría',
  producto: 'Producto',
  variante: 'Variante',
};

const formatDiscountValue = (row) => {
  if (row.tipo_descuento === 'envio_gratis') return 'Envío gratis';
  if (row.tipo_descuento === 'porcentaje') return `${Number(row.valor_descuento || 0)}%`;
  return formatCurrency(row.valor_descuento);
};

export const PromotionsPage = () => {
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formError, setFormError] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: null,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    esActivo: '',
    estadoCalculado: '',
    tipo_promocion: '',
    tipo_descuento: '',
    fecha_inicio: '',
    fecha_fin: '',
  });

  const {
    promotions,
    pagination,
    loading,
    fetching,
    error,
    saving,
    deleting,
    getPromotionById,
    savePromotion,
    removePromotion,
  } = usePromotions({
    pageNumber,
    pageSize,
    search,
    esActivo: toBooleanFilter(filters.esActivo),
    estado_calculado: filters.estadoCalculado || null,
    tipo_promocion: filters.tipo_promocion || null,
    tipo_descuento: filters.tipo_descuento || null,
    fecha_inicio: filters.fecha_inicio || null,
    fecha_fin: filters.fecha_fin || null,
  });

  const columns = [
    { field: 'nombre', headerName: 'Nombre', width: 220 },
    {
      field: 'tipo_promocion',
      headerName: 'Tipo de promoción',
      width: 170,
      renderCell: (row) => promotionTypeLabel[row.tipo_promocion] || row.tipo_promocion || '-',
    },
    {
      field: 'tipo_descuento',
      headerName: 'Tipo de descuento',
      width: 170,
      renderCell: (row) => discountTypeLabel[row.tipo_descuento] || row.tipo_descuento || '-',
    },
    {
      field: 'valor_descuento',
      headerName: 'Valor',
      width: 130,
      renderCell: formatDiscountValue,
    },
    { field: 'codigo', headerName: 'Código cupón', width: 150, emptyText: 'Sin código' },
    {
      field: 'aplica_a',
      headerName: 'Aplicable en',
      width: 160,
      renderCell: (row) => appliesToLabel[row.aplica_a] || row.aplica_a || '-',
    },
    {
      field: 'estado_calculado',
      headerName: 'Vigencia',
      width: 150,
      renderCell: (row) => {
        const config = getPromotionStatusConfig(row.estado_calculado);

        return (
          <Chip
            size="small"
            label={config.label}
            color={config.color}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'es_activa',
      headerName: 'Estado operativo',
      width: 160,
      type: 'boolean',
      trueLabel: 'Activa',
      falseLabel: 'Inactiva',
      trueColor: 'success',
      falseColor: 'error',
    },
    { field: 'total_aplicaciones', headerName: 'Aplicaciones', width: 130 },
    {
      field: 'updated_at',
      headerName: 'Última actualización',
      width: 190,
      renderCell: (row) => formatDate(row.updated_at),
    },
  ];

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedPromotion(null);
    setFormError('');
  };

  const handleViewPromotion = async (row) => {
    try {
      setFormError('');
      const promotion = await getPromotionById(row?.id);

      if (promotion) {
        setSelectedPromotion(promotion);
        setDetailOpen(true);
      }
    } catch (err) {
      setFormError(normalizeApiError(err) || 'No se pudo obtener el detalle de la promoción.');
    }
  };

  const handleEditPromotion = async (row) => {
    try {
      setFormError('');
      const promotion = await getPromotionById(row?.id);

      if (promotion) {
        setSelectedPromotion(promotion);
        setFormMode('edit');
        setFormOpen(true);
      }
    } catch (err) {
      setFormError(normalizeApiError(err) || 'No se pudo cargar la promoción para editar.');
    }
  };

  const handleConfirmDelete = async (promotionId) => {
    try {
      setFormError('');
      await removePromotion(promotionId);
      setConfirmDialog((prev) => ({ ...prev, open: false }));
      setSelectedPromotion(null);
    } catch (err) {
      setFormError(normalizeApiError(err) || 'No se pudo eliminar la promoción.');
    }
  };

  const actions = [
    {
      type: 'view',
      label: 'Ver detalles',
      onClick: handleViewPromotion,
    },
    {
      type: 'edit',
      label: 'Editar',
      onClick: handleEditPromotion,
    },
    {
      type: 'delete',
      label: 'Eliminar',
      onClick: (promotion) => {
        setConfirmDialog({
          open: true,
          action: 'delete',
          title: `Eliminar promoción: ${promotion.nombre}`,
          message: '¿Estás segura de eliminar esta promoción? Esta acción no se puede deshacer.',
          onConfirm: () => handleConfirmDelete(promotion.id),
        });
      },
    },
  ];

  const tableFilters = [
    {
      name: 'esActivo',
      label: 'Estado operativo',
      type: 'select',
      width: 190,
      options: [
        { label: 'Activas', value: 'true' },
        { label: 'Inactivas', value: 'false' },
      ],
    },
    {
      name: 'estadoCalculado',
      label: 'Vigencia',
      type: 'select',
      width: 180,
      options: [
        { label: 'Vigentes', value: 'vigente' },
        { label: 'Programadas', value: 'programada' },
        { label: 'Vencidas', value: 'vencida' },
        { label: 'Inactivas', value: 'inactiva' },
      ],
    },
    {
      name: 'tipo_promocion',
      label: 'Tipo de promoción',
      type: 'select',
      width: 200,
      options: [
        { label: 'Descuento directo', value: 'descuento_directo' },
        { label: 'Cupón', value: 'cupon' },
        { label: 'Envío gratis', value: 'envio_gratis' },
      ],
    },
    {
      name: 'tipo_descuento',
      label: 'Tipo de descuento',
      type: 'select',
      width: 200,
      options: [
        { label: 'Porcentaje', value: 'porcentaje' },
        { label: 'Monto fijo', value: 'monto_fijo' },
        { label: 'Envío gratis', value: 'envio_gratis' },
      ],
    },
    {
      name: 'fecha_inicio',
      label: 'Creado desde',
      type: 'date',
      width: 170,
    },
    {
      name: 'fecha_fin',
      label: 'Creado hasta',
      type: 'date',
      width: 170,
    },
  ];

  const handleCreatePromotion = () => {
    setSelectedPromotion(null);
    setFormError('');
    setFormMode('create');
    setFormOpen(true);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPageNumber(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPageNumber(1);
  };

  const handleFilterChange = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPageNumber(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({
      esActivo: '',
      estadoCalculado: '',
      tipo_promocion: '',
      tipo_descuento: '',
      fecha_inicio: '',
      fecha_fin: '',
    });
    setPageNumber(1);
  };

  const performSave = async (payload, id) => {
    try {
      setFormError('');
      await savePromotion(payload, id);
      handleCloseForm();
      setConfirmDialog((prev) => ({ ...prev, open: false }));
    } catch (err) {
      setFormError(normalizeApiError(err) || 'No se pudo guardar la promoción.');
      throw err;
    }
  };

  const handleSave = async (payload, id) => {
    if (formMode === 'edit') {
      setConfirmDialog({
        open: true,
        action: 'warning',
        title: 'Guardar cambios',
        message: '¿Deseas guardar los cambios en esta promoción?',
        onConfirm: () => performSave(payload, id),
      });

      return;
    }

    return performSave(payload, id);
  };

  return (
    <PlaceholderPage title="Promociones" description="Gestiona descuentos, cupones y envío gratis.">
      <ErrorMessage message={error || formError} />

      <AdminResourceTable
        rows={promotions}
        columns={columns}
        actions={actions}
        pagination={pagination}
        loading={loading || fetching}
        searchValue={search}
        searchLabel="Buscar promoción"
        filters={tableFilters}
        filterValues={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onPageChange={setPageNumber}
        onPageSizeChange={handlePageSizeChange}
        primaryActionLabel="Crear promoción"
        onPrimaryAction={handleCreatePromotion}
        emptyTitle="No hay promociones"
        emptyDescription="Intenta ajustar la búsqueda, cambiar los filtros o crear una nueva promoción."
      />

      <PromotionFormDialog
        key={`${formMode}-${selectedPromotion?.id ?? 'new'}`}
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSave}
        promotion={selectedPromotion}
        mode={formMode}
        loading={saving}
        error={formError}
      />

      <PromotionDetailDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSelectedPromotion(null);
        }}
        promotion={selectedPromotion}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        action={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
        onConfirm={confirmDialog.onConfirm}
        loading={deleting || saving}
      />
    </PlaceholderPage>
  );
};
