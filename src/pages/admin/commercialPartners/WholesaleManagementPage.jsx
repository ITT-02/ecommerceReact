import { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import { useDebouncedValue } from '../../../hooks/common/useDebouncedValue';
import { useWholesaleManagement } from '../../../hooks/partners/useWholesale';
import { formatCurrency } from '../../../utils/formatters';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const statusColor = {
  pendiente: 'warning',
  aprobado: 'success',
  rechazado: 'error',
  suspendido: 'default',
};

const statusLabel = {
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  suspendido: 'Suspendido',
};

const getVariantId = (variant) => variant?.variante_id || variant?.id || '';

const getVariantLabel = (variant) =>
  [
    variant?.producto_nombre,
    variant?.nombre_variante,
    variant?.codigo_referencia || variant?.codigoproducto,
  ].filter(Boolean).join(' - ') || getVariantId(variant);

const DetailLine = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={700}>{value || '-'}</Typography>
  </Box>
);

const makeVariantOptionFromTier = (tier) => ({
  id: tier.variante_id,
  variante_id: tier.variante_id,
  producto_nombre: tier.producto_nombre,
  nombre_variante: tier.nombre_variante,
  codigo_referencia: tier.codigo_referencia,
  codigoproducto: tier.codigoproducto,
  precio: tier.precio_lista,
  precio_lista: tier.precio_lista,
});

export const WholesaleManagementPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [estado, setEstado] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(() => getDefaultAdminDateFilters());

  const [tiersPageNumber, setTiersPageNumber] = useState(1);
  const [tiersPageSize, setTiersPageSize] = useState(10);
  const [tiersSearch, setTiersSearch] = useState('');
  const [tiersFilters, setTiersFilters] = useState(() => getDefaultAdminDateFilters());

  const [variantId, setVariantId] = useState('');
  const [selectedVariantOption, setSelectedVariantOption] = useState(null);
  const [variantSearch, setVariantSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogMode, setDialogMode] = useState('detail');
  const [pendingReviewAction, setPendingReviewAction] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [tierForm, setTierForm] = useState({ id: '', cantidadMinima: '', precioUnitario: '' });
  const [notice, setNotice] = useState('');
  const [tierToDelete, setTierToDelete] = useState(null);

  const debouncedVariantSearch = useDebouncedValue(variantSearch, 450);
  const debouncedTiersSearch = useDebouncedValue(tiersSearch, 450);

  const {
    requests,
    pagination,
    variants,
    allTiers,
    tiersPagination,
    tiers,
    loading,
    fetching,
    variantsFetching,
    saving,
    error,
    reviewRequest,
    saveTier,
    deleteTier,
  } = useWholesaleManagement({
    pageNumber,
    pageSize,
    estado: estado || null,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
    variantId,
    search,
    variantSearch: debouncedVariantSearch,
    tiersPageNumber,
    tiersPageSize,
    tiersSearch: debouncedTiersSearch,
    tiersFechaInicio: tiersFilters.fechaInicio || null,
    tiersFechaFin: tiersFilters.fechaFin || null,
  });

  const selectedVariant = useMemo(() => {
    return (
      selectedVariantOption ||
      variants.find((variant) => String(getVariantId(variant)) === String(variantId)) ||
      null
    );
  }, [selectedVariantOption, variants, variantId]);

  const variantOptions = useMemo(() => {
    if (!selectedVariant) return variants;
    const exists = variants.some((variant) => String(getVariantId(variant)) === String(getVariantId(selectedVariant)));
    return exists ? variants : [selectedVariant, ...variants];
  }, [selectedVariant, variants]);

  const invalidDateRange = isDateRangeInvalid({ values: filters });
  const invalidTiersDateRange = isDateRangeInvalid({ values: tiersFilters });
  const isReviewMode = dialogMode === 'review';
  const canReviewSelected = selectedRequest?.estado === 'pendiente';

  const openDetailDialog = (row) => {
    setSelectedRequest(row);
    setDialogMode('detail');
    setReviewComment(row?.comentario_revision || '');
  };

  const openReviewDialog = (row) => {
    setSelectedRequest(row);
    setDialogMode('review');
    setReviewComment(row?.comentario_revision || '');
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setDialogMode('detail');
    setPendingReviewAction('');
    setReviewComment('');
  };

  const resetTierForm = () => {
    setTierForm({ id: '', cantidadMinima: '', precioUnitario: '' });
  };

  const handleReview = async () => {
    if (!selectedRequest || !pendingReviewAction) return;

    await reviewRequest({
      requestId: selectedRequest.id,
      action: pendingReviewAction,
      comment: reviewComment,
    });
    setNotice(pendingReviewAction === 'aprobar' ? 'Cliente aprobado como mayorista.' : 'Solicitud mayorista rechazada.');
    closeDialog();
  };

  const handleSaveTier = async (event) => {
    event.preventDefault();
    if (!variantId || Number(tierForm.cantidadMinima) <= 0 || Number(tierForm.precioUnitario) <= 0) return;

    await saveTier({
      tierId: tierForm.id || null,
      varianteId: variantId,
      cantidadMinima: tierForm.cantidadMinima,
      precioUnitario: tierForm.precioUnitario,
    });

    setNotice(tierForm.id ? 'Tramo mayorista actualizado.' : 'Tramo mayorista guardado.');
    resetTierForm();
  };

  const handleEditTier = (tier) => {
    const variantOption = makeVariantOptionFromTier(tier);
    setSelectedVariantOption(variantOption);
    setVariantId(tier.variante_id);
    setVariantSearch(getVariantLabel(variantOption));
    setTierForm({
      id: tier.id,
      cantidadMinima: tier.cantidad_minima ?? '',
      precioUnitario: tier.precio_unitario ?? '',
    });
  };


  const handleConfirmDeleteTier = async () => {
    if (!tierToDelete?.id) return;

    await deleteTier(tierToDelete.id);
    setNotice('Tramo mayorista eliminado.');
    setTierToDelete(null);
  };

  const requestColumns = [
    { field: 'nombre_completo', headerName: 'Cliente', width: 220, emptyText: 'Sin nombre' },
    { field: 'negocio_nombre', headerName: 'Negocio', width: 220, emptyText: '-' },
    { field: 'ruc', headerName: 'RUC / Doc.', width: 140, emptyText: '-' },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 150,
      renderCell: (row) => (
        <Chip
          size="small"
          label={statusLabel[row.estado] || row.estado}
          color={statusColor[row.estado] || 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 150,
      renderCell: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
    },
  ];

  const tierColumns = [
    {
      field: 'producto_nombre',
      headerName: 'Producto',
      width: 250,
      emptyText: '-',
    },
    {
      field: 'nombre_variante',
      headerName: 'Variante',
      width: 230,
      renderCell: (row) => row.nombre_variante || row.codigo_referencia || row.codigoproducto || 'Variante principal',
    },
    {
      field: 'precio_lista',
      headerName: 'Precio lista',
      width: 130,
      renderCell: (row) => formatCurrency(row.precio_lista || 0),
    },
    { field: 'cantidad_minima', headerName: 'Cantidad min.', width: 130 },
    {
      field: 'precio_unitario',
      headerName: 'Precio mayorista',
      width: 160,
      renderCell: (row) => formatCurrency(row.precio_unitario || 0),
    },
    {
      field: 'es_activo',
      headerName: 'Estado',
      type: 'boolean',
      width: 120,
      trueLabel: 'Activo',
      falseLabel: 'Inactivo',
    },
    {
      field: 'updated_at',
      headerName: 'Actualizado',
      width: 140,
      renderCell: (row) => (row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '-'),
    },
  ];

  return (
    <PlaceholderPage
      title="Mayoristas"
      description="Aprueba clientes mayoristas y administra precios por volumen configurados en variantes."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error} />
        {invalidDateRange && <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />}
        {invalidTiersDateRange && <ErrorMessage message="La fecha inicial de tramos no puede ser mayor que la fecha final." />}

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <AdminResourceTable
          rows={invalidDateRange ? [] : requests}
          columns={requestColumns}
          actions={[
            {
              type: 'view',
              label: 'Ver detalle',
              onClick: openDetailDialog,
            },
            {
              type: 'review',
              label: 'Evaluar solicitud',
              visible: (row) => row.estado === 'pendiente',
              onClick: openReviewDialog,
            },
          ]}
          loading={loading || fetching || saving}
          pagination={invalidDateRange ? emptyPagination({ pageNumber, pageSize }) : pagination}
          searchValue={search}
          searchLabel="Buscar cliente"
          filterValues={{ estado, ...filters }}
          filters={[
            {
              name: 'estado',
              label: 'Estado',
              type: 'select',
              width: 180,
              options: [
                { label: 'Todos', value: '' },
                { label: 'Pendientes', value: 'pendiente' },
                { label: 'Aprobados', value: 'aprobado' },
                { label: 'Rechazados', value: 'rechazado' },
                { label: 'Suspendidos', value: 'suspendido' },
              ],
            },
            {
              name: 'fechaInicio',
              label: 'Desde',
              type: 'date',
              width: 160,
              maxDate: filters.fechaFin || undefined,
            },
            {
              name: 'fechaFin',
              label: 'Hasta',
              type: 'date',
              width: 160,
              minDate: filters.fechaInicio || undefined,
            },
          ]}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            if (name === 'estado') setEstado(value);
            else setFilters((current) => ({ ...current, [name]: value }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setEstado('');
            setSearch('');
            setFilters(getDefaultAdminDateFilters());
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          emptyTitle="Sin solicitudes mayoristas"
          emptyDescription="Cuando un cliente solicite aprobación mayorista, aparecera aqui."
          maxHeight={360}
        />

        <Box sx={(theme) => ({ border: '1px solid', borderColor: 'divider', borderRadius: theme.palette.custom.radius.xs, p: { xs: 1.5, md: 2 } })}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Precios mayoristas por variante
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define cantidades mínimas y precios especiales. Solo se aplican a clientes mayoristas aprobados.
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSaveTier}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) 150px 160px auto auto' },
                gap: 1.25,
                alignItems: 'flex-start',
              }}
            >
              <Autocomplete
                options={variantOptions}
                value={selectedVariant}
                inputValue={variantSearch}
                loading={variantsFetching}
                onInputChange={(_event, value, reason) => {
                  setVariantSearch(value);
                  if (reason === 'clear') {
                    setVariantId('');
                    setSelectedVariantOption(null);
                    resetTierForm();
                  }
                }}
                onChange={(_event, value) => {
                  setSelectedVariantOption(value);
                  setVariantId(getVariantId(value));
                  resetTierForm();
                }}
                getOptionLabel={getVariantLabel}
                isOptionEqualToValue={(option, value) => getVariantId(option) === getVariantId(value)}
                noOptionsText="Escribe para buscar variantes"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Variante"
                    placeholder="Producto, variante o codigo"
                  />
                )}
              />

              <TextField
                label="Cantidad min."
                type="number"
                value={tierForm.cantidadMinima}
                onChange={(event) => setTierForm((current) => ({ ...current, cantidadMinima: event.target.value }))}
                disabled={!variantId}
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
              />
              <TextField
                label="Precio mayorista"
                type="number"
                value={tierForm.precioUnitario}
                onChange={(event) => setTierForm((current) => ({ ...current, precioUnitario: event.target.value }))}
                disabled={!variantId}
                slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={!variantId || Number(tierForm.cantidadMinima) <= 0 || Number(tierForm.precioUnitario) <= 0 || saving}
                sx={{ minHeight: 56 }}
              >
                {tierForm.id ? 'Actualizar' : 'Agregar'}
              </Button>
              {tierForm.id && (
                <Button type="button" variant="outlined" onClick={resetTierForm} sx={{ minHeight: 56 }}>
                  Cancelar
                </Button>
              )}
            </Box>

            {selectedVariant && (
              <Alert severity="info">
                {getVariantLabel(selectedVariant)} · Precio lista: {formatCurrency(selectedVariant.precio || selectedVariant.precio_lista || 0)}
                {tiers.length > 0 ? ` · ${tiers.length} tramo(s) configurado(s)` : ''}
              </Alert>
            )}

            <AdminResourceTable
              rows={invalidTiersDateRange ? [] : allTiers}
              columns={tierColumns}
              actions={[
                {
                  type: 'edit',
                  label: 'Editar precio',
                  onClick: handleEditTier,
                },
                {
                  type: 'delete',
                  label: 'Eliminar precio',
                  onClick: (row) => setTierToDelete(row),
                },
              ]}
              loading={loading || fetching || saving}
              pagination={invalidTiersDateRange ? emptyPagination({ pageNumber: tiersPageNumber, pageSize: tiersPageSize }) : tiersPagination}
              searchValue={tiersSearch}
              searchLabel="Buscar producto o variante"
              filterValues={tiersFilters}
              filters={[
                {
                  name: 'fechaInicio',
                  label: 'Desde',
                  type: 'date',
                  width: 160,
                  maxDate: tiersFilters.fechaFin || undefined,
                },
                {
                  name: 'fechaFin',
                  label: 'Hasta',
                  type: 'date',
                  width: 160,
                  minDate: tiersFilters.fechaInicio || undefined,
                },
              ]}
              onSearchChange={(value) => {
                setTiersSearch(value);
                setTiersPageNumber(1);
              }}
              onFilterChange={(name, value) => {
                setTiersFilters((current) => ({ ...current, [name]: value }));
                setTiersPageNumber(1);
              }}
              onResetFilters={() => {
                setTiersSearch('');
                setTiersFilters(getDefaultAdminDateFilters());
                setTiersPageNumber(1);
              }}
              onPageChange={setTiersPageNumber}
              onPageSizeChange={(value) => {
                setTiersPageSize(value);
                setTiersPageNumber(1);
              }}
              emptyTitle="Sin precios mayoristas"
              emptyDescription="Agrega tramos desde el formulario superior o ajusta los filtros."
              maxHeight={420}
            />
          </Stack>
        </Box>
      </Stack>

      <AdminDialog
        open={Boolean(selectedRequest)}
        onClose={closeDialog}
        title={isReviewMode ? 'Evaluar solicitud mayorista' : 'Detalle de solicitud mayorista'}
        icon={isReviewMode ? <StorefrontOutlinedIcon /> : <VisibilityOutlinedIcon />}
        maxWidth="sm"
        loading={saving}
        actions={(
          <>
            <Button onClick={closeDialog} disabled={saving}>Cerrar</Button>
            {isReviewMode && (
              <>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => setPendingReviewAction('rechazar')}
                  disabled={!canReviewSelected || saving}
                >
                  Rechazar solicitud
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setPendingReviewAction('aprobar')}
                  disabled={!canReviewSelected || saving}
                >
                  Aprobar mayorista
                </Button>
              </>
            )}
          </>
        )}
      >
        {selectedRequest && (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Cliente" value={selectedRequest.nombre_completo || selectedRequest.usuario_id} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Negocio" value={selectedRequest.negocio_nombre} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="RUC / documento" value={selectedRequest.ruc || selectedRequest.documento_identidad} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Teléfono" value={selectedRequest.telefono || selectedRequest.perfil_telefono} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Giro" value={selectedRequest.giro_negocio} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Volumen estimado" value={selectedRequest.volumen_estimado} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Estado" value={statusLabel[selectedRequest.estado] || selectedRequest.estado} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailLine label="Mensaje" value={selectedRequest.mensaje} />
              </Grid>
            </Grid>

            {isReviewMode ? (
              <TextField
                label="Comentario interno"
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                helperText="Este comentario será visible como resultado de revisión para el cliente."
                fullWidth
                multiline
                minRows={2}
              />
            ) : selectedRequest.comentario_revision ? (
              <Alert severity="info">Comentario de revisión: {selectedRequest.comentario_revision}</Alert>
            ) : null}
          </Stack>
        )}
      </AdminDialog>


      <ConfirmDialog
        open={Boolean(pendingReviewAction)}
        action={pendingReviewAction === 'aprobar' ? 'approve' : 'warning'}
        title={pendingReviewAction === 'aprobar' ? 'Aprobar cliente mayorista' : 'Rechazar solicitud mayorista'}
        message={
          pendingReviewAction === 'aprobar'
            ? '¿Deseas aprobar a este cliente como mayorista? Desde ese momento podrá acceder a precios por volumen configurados.'
            : '¿Deseas rechazar esta solicitud mayorista? El cliente verá el resultado en Mis solicitudes.'
        }
        confirmText={pendingReviewAction === 'aprobar' ? 'aprobar' : 'rechazar'}
        loading={saving}
        onCancel={() => setPendingReviewAction('')}
        onConfirm={handleReview}
      />

      <ConfirmDialog
        open={Boolean(tierToDelete)}
        action="delete"
        title="Eliminar precio mayorista"
        message={tierToDelete
          ? `¿Deseas eliminar el tramo de ${tierToDelete.cantidad_minima} unidad(es) para ${tierToDelete.producto_nombre || 'este producto'}?`
          : '¿Deseas eliminar este precio mayorista?'}
        confirmText="Eliminar"
        loading={saving}
        onCancel={() => setTierToDelete(null)}
        onConfirm={handleConfirmDeleteTier}
      />
    </PlaceholderPage>
  );
};
