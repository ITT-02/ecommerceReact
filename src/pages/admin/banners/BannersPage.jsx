// Pagina administrativa para gestionar banners de la tienda.

import { useState } from 'react';
import {
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { BannerForm } from '../../../components/admin/banners/BannerForm';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PageHeader } from '../../../components/common/PageHeader';

import { useBanners } from '../../../hooks/marketing/useBanners';
import {
  initialBannerFormData,
  mapBannerToFormData,
  mapFormDataToBanner,
} from '../../../adapters/bannersMapper';

export const BannersPage = () => {
  const [formData, setFormData] = useState(initialBannerFormData);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ esActivo: '' });
  const [detailLoading, setDetailLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const {
    banners,
    pagination,
    loading,
    fetching,
    error,
    saving,
    deleting,
    getBannerById,
    saveBanner,
    removeBanner,
  } = useBanners({
    pageNumber,
    pageSize,
    search,
    esActivo: filters.esActivo === '' ? null : filters.esActivo === 'true',
  });

  const actionLoading = saving || deleting;
  
  const changeInput = (event) => {
    const { name, value, type, checked } = event.target;
    setFormError(null);
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const changeFileInput = (file) => {
      setFormError(null);
      setFormData((current) => ({
        ...current,
        _file: file,
      }));
    };
  const removeFileInput = () => {
    setFormError(null);

    setFormData((current) => ({
      ...current,
      _file: null,
      imagen_url: '',
      imagen_path: '',
    }));
  };
  const resetForm = () => {
    setFormData(initialBannerFormData);
    setEditingId(null);
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleCloseForm = () => {
    if (saving) return;
    resetForm();
  };

  const handleCreate = () => {
    setFormData(initialBannerFormData);
    setEditingId(null);
    setIsFormOpen(true);
    setFormError(null);
  };

  const handleEdit = async (banner) => {
    try {
      setDetailLoading(true);
      const bannerDetail = await getBannerById(banner.id);
      setFormData(mapBannerToFormData(bannerDetail || banner));
      setEditingId(banner.id);
      setIsFormOpen(true);
      setFormError(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      formData.fecha_inicio &&
      formData.fecha_fin &&
      formData.fecha_inicio > formData.fecha_fin
    ) {
      setFormError('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return;
    }

    try {
      const bannerData = await mapFormDataToBanner(formData);
      await saveBanner(bannerData, editingId);
      resetForm();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;

    try {
      if (confirm.action === 'delete') {
        await removeBanner(confirm.banner.id);
      }
    } catch {
      // el error se muestra via el estado error del hook
    } finally {
      setConfirm(null);
    }
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
    setFilters({ esActivo: '' });
    setPageNumber(1);
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setPageNumber(1);
  };

  
  const columns = [
    {
      field: 'imagen_url',
      headerName: 'Imagen',
      type: 'image',
      altField: 'titulo',
      imageSize: 48,
      width: 90,
    },
    {
      field: 'titulo',
      headerName: 'Titulo',
      width: 220,
      emptyText: 'Sin titulo',
    },
    {
      field: 'subtitulo',
      headerName: 'Subtitulo',
      width: 280,
      emptyText: 'Sin subtitulo',
    },
    {
      field: 'boton_texto',
      headerName: 'Boton',
      width: 150,
      emptyText: 'Sin boton',
    },
    {
      field: 'orden_visual',
      headerName: 'Orden',
      width: 95,
      renderCell: (banner) => (
        <Typography variant="body2" fontWeight={700}>
          {banner.orden_visual ?? 0}
        </Typography>
      ),
    },
    {
      field: 'es_activo',
      headerName: 'Estado',
      type: 'boolean',
      width: 130,
      trueLabel: 'Activo',
      falseLabel: 'Inactivo',
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
      onClick: (banner) => setConfirm({ action: 'delete', banner }),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      <PageHeader
        title="Banners"
        description="Gestiona los banners visibles en la pagina principal de la tienda."
      />

      <ErrorMessage message={error} />

      <AdminResourceTable
        rows={banners}
        columns={columns}
        actions={actions}
        loading={loading || fetching || detailLoading}
        pagination={pagination}
        searchValue={search}
        searchLabel="Buscar banner"
        filters={tableFilters}
        filterValues={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onPageChange={setPageNumber}
        onPageSizeChange={handlePageSizeChange}
        primaryActionLabel="Nuevo banner"
        onPrimaryAction={handleCreate}
        emptyTitle="No hay banners"
        emptyDescription="Intenta ajustar los filtros o crea un nuevo banner."
        maxHeight={520}
      />

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
          {editingId ? 'Editar banner' : 'Nuevo banner'}
          <Typography variant="body2" color="text.secondary">
            Completa la informacion del banner que se mostrara en la tienda.
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <ErrorMessage message={formError || error} />

          <BannerForm
            editingId={editingId}
            formData={formData}
            loading={saving}
            onCancel={handleCloseForm}
            onChange={changeInput}
            onFileChange={changeFileInput}
            onFileRemove={removeFileInput}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirm)}
        action="delete"
        title="Eliminar banner"
        message="Esta accion eliminara el banner de forma permanente."
        loading={actionLoading}
        onCancel={() => setConfirm(null)}
        onConfirm={handleConfirm}
      />
    </Container>
  );
};
