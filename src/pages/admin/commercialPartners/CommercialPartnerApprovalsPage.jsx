import { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  usePartnerProductCommercialConditions,
  usePartnerProductRequests,
} from '../../../hooks/partners/useCommercialPartners';
import { useProducts } from '../../../hooks/catalog/useProducts';
import { useWarehouses } from '../../../hooks/inventory/useInventory/useWarehouses';
import { formatCurrency } from '../../../utils/formatters';
import {
  emptyPagination,
  getDefaultAdminDateFilters,
  isDateRangeInvalid,
} from '../../../utils/defaultDateRange';

const statusLabel = {
  pendiente_revision: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  borrador: 'Borrador',
};

const statusColor = {
  pendiente_revision: 'warning',
  aprobado: 'success',
  rechazado: 'error',
  borrador: 'default',
};

const decisionLabel = {
  aprobar: 'aprobar',
  rechazar: 'rechazar',
};

const stockModeOptions = [
  {
    value: 'bajo_pedido_socio',
    label: 'Preparación con stock informado',
    helper: 'Recomendado cuando el producto permanece con el socio. El cliente solo podrá comprar hasta la cantidad informada; no se registra como almacén Aliqora.',
  },
  {
    value: 'ingreso_almacen',
    label: 'Stock en custodia Aliqora',
    helper: 'Úsalo solo si el socio deja unidades físicas en Aliqora. Se registra cantidad en almacén, pero la ganancia se controla por comisión.',
  },
  {
    value: 'sin_ingreso',
    label: 'Publicado sin disponibilidad',
    helper: 'El producto queda aprobado para catálogo, pero no podrá comprarse hasta registrar stock informado o stock en custodia.',
  },
];

const getStockModeHelper = (mode) => stockModeOptions.find((option) => option.value === mode)?.helper || '';


const DetailLine = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body2" fontWeight={700}>{value || '-'}</Typography>
  </Box>
);

const getAttributeDetails = (requestAttributes = [], attributeOptions = []) => {
  if (!Array.isArray(requestAttributes) || requestAttributes.length === 0) return [];

  return requestAttributes
    .map((item) => {
      const attribute = attributeOptions.find((option) => option.id === item?.atributo_id);
      const value = attribute?.valores?.find((option) => option.id === item?.atributo_valor_id);

      if (!attribute || !value) return null;

      return {
        id: `${item.atributo_id}-${item.atributo_valor_id}`,
        label: attribute.nombre,
        value: value.valor,
      };
    })
    .filter(Boolean);
};

export const CommercialPartnerApprovalsPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [catalogPageNumber, setCatalogPageNumber] = useState(1);
  const [catalogPageSize, setCatalogPageSize] = useState(10);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogStatus, setCatalogStatus] = useState('');
  const [estado, setEstado] = useState('pendiente_revision');
  const [filters, setFilters] = useState(() => getDefaultAdminDateFilters());
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState(null);
  const [conditionsForm, setConditionsForm] = useState({
    commissionPercent: '',
    status: 'activo',
  });
  const [conditionsError, setConditionsError] = useState('');
  const [dialogMode, setDialogMode] = useState('detail');
  const [pendingReviewAction, setPendingReviewAction] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [commissionPercent, setCommissionPercent] = useState('');
  const [stockMode, setStockMode] = useState('bajo_pedido_socio');
  const [warehouseId, setWarehouseId] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
    const [reviewError, setReviewError] = useState('');
  const [notice, setNotice] = useState('');

  const {
    requests,
    attributes,
    pagination,
    loading,
    fetching,
    saving,
    error,
    reviewRequest,
  } = usePartnerProductRequests({
    pageNumber,
    pageSize,
    estado: estado || null,
    scope: 'admin',
    search,
    fechaInicio: filters.fechaInicio || null,
    fechaFin: filters.fechaFin || null,
  });
  const {
    products: partnerCatalogProducts,
    pagination: partnerCatalogPagination,
    loading: loadingPartnerCatalog,
    fetching: fetchingPartnerCatalog,
    error: partnerCatalogError,
  } = useProducts({
    pageNumber: catalogPageNumber,
    pageSize: catalogPageSize,
    search: catalogSearch,
    esActivo: catalogStatus === '' ? null : catalogStatus === 'activo',
    origen: 'socio',
  });

  const {
    updateCommercialConditions,
    updating: updatingCommercialConditions,
    error: commercialConditionsError,
  } = usePartnerProductCommercialConditions();

  const { warehouses } = useWarehouses();
  const invalidDateRange = isDateRangeInvalid({ values: filters });
  const isReviewMode = dialogMode === 'review';
  const canReviewSelected = selectedRequest?.estado === 'pendiente_revision';
  const selectedAttributeDetails = getAttributeDetails(selectedRequest?.atributos, attributes);
  const selectedWarehouse = warehouses.find((warehouse) => warehouse.id === warehouseId) || null;

  const setDefaultStockReviewValues = (row) => {
    const quantity = Number(row?.variante?.cantidad_disponible_socio ?? 0);
    setStockQuantity(quantity > 0 ? String(quantity) : '');
    setWarehouseId('');
    setStockMode('bajo_pedido_socio');
    setReviewError('');
  };

  const openDetailDialog = (row) => {
    setSelectedRequest(row);
    setDialogMode('detail');
    setReviewComment(row?.comentario_revision || '');
    setCommissionPercent('');
    setDefaultStockReviewValues(row);
  };

  const openReviewDialog = (row) => {
    setSelectedRequest(row);
    setDialogMode('review');
    setReviewComment(row?.comentario_revision || '');
    setCommissionPercent(row?.producto?.socio_comision_porcentaje ?? '');
    setDefaultStockReviewValues(row);
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setDialogMode('detail');
    setPendingReviewAction('');
    setReviewComment('');
    setCommissionPercent('');
    setStockMode('bajo_pedido_socio');
    setWarehouseId('');
    setStockQuantity('');
    setReviewError('');
  };

  const openCommercialConditionsDialog = (row) => {
    setSelectedCatalogProduct(row);
    setConditionsForm({
      commissionPercent: row?.socio_comision_porcentaje ?? '',
      status: row?.es_activo ? 'activo' : 'retirado',
    });
    setConditionsError('');
  };

  const closeCommercialConditionsDialog = () => {
    setSelectedCatalogProduct(null);
    setConditionsForm({ commissionPercent: '', status: 'activo' });
    setConditionsError('');
  };

  const handleConditionsChange = (field, value) => {
    setConditionsForm((current) => ({ ...current, [field]: value }));
    setConditionsError('');
  };

  const handleSaveCommercialConditions = async () => {
    if (!selectedCatalogProduct) return;

    const commission = Number(conditionsForm.commissionPercent);

    if (Number.isNaN(commission) || commission < 0 || commission > 100) {
      setConditionsError('La comisión debe estar entre 0 y 100%.');
      return;
    }

    await updateCommercialConditions({
      productId: selectedCatalogProduct.id,
      commissionPercent: commission,
      isActive: conditionsForm.status === 'activo',
    });

    setNotice('Condiciones comerciales actualizadas. El cambio aplicará a ventas nuevas.');
    closeCommercialConditionsDialog();
  };

  const validateStockReview = (action) => {
    if (action !== 'aprobar') return '';

    if (stockMode === 'bajo_pedido_socio' && Number(stockQuantity) <= 0) {
      return 'Indica la cantidad máxima disponible que el socio confirmó para vender.';
    }

    if (stockMode === 'ingreso_almacen') {
      if (!warehouseId) return 'Selecciona el almacén donde ingresará el stock inicial.';
      if (Number(stockQuantity) <= 0) return 'La cantidad de ingreso debe ser mayor a cero.';
    }

    return '';
  };

  const requestReviewAction = (action) => {
    const validation = validateStockReview(action);
    if (validation) {
      setReviewError(validation);
      return;
    }

    setReviewError('');
    setPendingReviewAction(action);
  };

  const handleReview = async () => {
    if (!selectedRequest || !pendingReviewAction) return;

    await reviewRequest({
      requestId: selectedRequest.id,
      action: pendingReviewAction,
      comment: reviewComment,
      commissionPercent,
      stockMode,
      warehouseId,
      stockQuantity,
    });

    setNotice(pendingReviewAction === 'aprobar' ? 'Producto aprobado y publicado.' : 'Solicitud de producto rechazada.');
    closeDialog();
  };

  const columns = [
    {
      field: 'producto',
      headerName: 'Producto',
      width: 260,
      renderCell: (row) => row.producto?.nombre || '-',
    },
    {
      field: 'socio_nombre',
      headerName: 'Socio',
      width: 220,
      emptyText: 'Sin nombre',
    },
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
      field: 'precio',
      headerName: 'Precio',
      width: 140,
      renderCell: (row) => formatCurrency(row.variante?.precio || 0),
    },
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 160,
      renderCell: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'),
    },
  ];

  const partnerCatalogColumns = useMemo(() => [
    {
      field: 'imagen_principal_url',
      headerName: 'Imagen',
      type: 'image',
      altField: 'nombre',
      imageSize: 44,
      width: 84,
    },
    { field: 'nombre', headerName: 'Producto publicado', width: 240, emptyText: 'Sin nombre' },
    { field: 'socio_nombre', headerName: 'Socio', width: 210, emptyText: '-' },
    { field: 'categoria_nombre', headerName: 'Categoría', width: 180, emptyText: '-' },
    {
      field: 'es_activo',
      headerName: 'Estado tienda',
      width: 155,
      renderCell: (row) => (
        <Chip
          size="small"
          label={row.es_activo ? 'Publicado' : 'Retirado'}
          color={row.es_activo ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'socio_comision_porcentaje',
      headerName: 'Comisión Aliqora',
      width: 160,
      renderCell: (row) => `${Number(row.socio_comision_porcentaje || 0).toFixed(2)}%`,
    },
    {
      field: 'updated_at',
      headerName: 'Actualizado',
      width: 150,
      renderCell: (row) => (row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '-'),
    },
  ], []);

  const partnerCatalogFilters = [
    {
      name: 'estadoTienda',
      label: 'Estado tienda',
      type: 'select',
      width: 190,
      options: [
        { label: 'Publicados', value: 'activo' },
        { label: 'Retirados', value: 'retirado' },
      ],
    },
  ];

  const tableFilters = [
    {
      name: 'estado',
      label: 'Estado',
      type: 'select',
      width: 190,
      options: [
        { label: 'Todos', value: '' },
        { label: 'Pendientes', value: 'pendiente_revision' },
        { label: 'Aprobados', value: 'aprobado' },
        { label: 'Rechazados', value: 'rechazado' },
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
  ];

  return (
    <PlaceholderPage
      title="Productos de socios comerciales"
      description="Revisa propuestas pendientes y consulta qué productos de socios están publicados o retirados del catálogo."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || partnerCatalogError || commercialConditionsError} />
        {invalidDateRange && <ErrorMessage message="La fecha inicial no puede ser mayor que la fecha final." />}

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <AdminResourceTable
          rows={invalidDateRange ? [] : requests}
          columns={columns}
          actions={[
            {
              type: 'view',
              label: 'Ver detalle',
              onClick: openDetailDialog,
            },
            {
              type: 'review',
              label: 'Evaluar producto',
              visible: (row) => row.estado === 'pendiente_revision',
              onClick: openReviewDialog,
            },
          ]}
          loading={loading || fetching}
          pagination={invalidDateRange ? emptyPagination({ pageNumber, pageSize }) : pagination}
          searchValue={search}
          searchLabel="Buscar"
          filterValues={{ estado, ...filters }}
          filters={tableFilters}
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
          emptyTitle="No hay solicitudes"
          emptyDescription="Cuando un socio envíe productos, aparecerán aquí."
          maxHeight={420}
        />

        <Box>
          <Stack spacing={0.75} sx={{ mb: 1.25 }}>
            <Typography variant="h6" fontWeight={850}>
              Catálogo publicado por socios
            </Typography>
            <Alert severity="info" sx={{ borderRadius: (theme) => theme.palette.custom.radius.xs }}>
              Esta lista muestra los productos de socios que ya fueron aprobados y creados en el catálogo. Si se retiran de tienda, permanecen aquí para trazabilidad.
            </Alert>
          </Stack>

          <AdminResourceTable
            rows={partnerCatalogProducts}
            columns={partnerCatalogColumns}
            actions={[
              {
                type: 'edit',
                label: 'Editar condiciones comerciales',
                onClick: openCommercialConditionsDialog,
              },
            ]}
            loading={loadingPartnerCatalog || fetchingPartnerCatalog}
            pagination={partnerCatalogPagination}
            searchValue={catalogSearch}
            searchLabel="Buscar producto o socio"
            filters={partnerCatalogFilters}
            filterValues={{ estadoTienda: catalogStatus }}
            onSearchChange={(value) => {
              setCatalogSearch(value);
              setCatalogPageNumber(1);
            }}
            onFilterChange={(name, value) => {
              if (name === 'estadoTienda') setCatalogStatus(value);
              setCatalogPageNumber(1);
            }}
            onResetFilters={() => {
              setCatalogSearch('');
              setCatalogStatus('');
              setCatalogPageNumber(1);
            }}
            onPageChange={setCatalogPageNumber}
            onPageSizeChange={(value) => {
              setCatalogPageSize(value);
              setCatalogPageNumber(1);
            }}
            emptyTitle="Sin productos de socios"
            emptyDescription="Cuando apruebes propuestas de socios, los productos publicados aparecerán en esta lista."
            maxHeight={420}
          />
        </Box>
      </Stack>

      <AdminDialog
        open={Boolean(selectedRequest)}
        onClose={closeDialog}
        title={isReviewMode ? 'Evaluar producto de socio' : 'Detalle de producto de socio'}
        icon={isReviewMode ? <FactCheckOutlinedIcon /> : <VisibilityOutlinedIcon />}
        maxWidth="md"
        loading={saving}
        actions={(
          <>
            <Button onClick={closeDialog} disabled={saving}>Cerrar</Button>
            {isReviewMode && (
              <>
                <Button
                  color="error"
                  variant="outlined"
                  onClick={() => requestReviewAction('rechazar')}
                  disabled={!canReviewSelected || saving}
                >
                  Rechazar producto
                </Button>
                <Button
                  variant="contained"
                  onClick={() => requestReviewAction('aprobar')}
                  disabled={!canReviewSelected || saving}
                >
                  Aprobar y publicar
                </Button>
              </>
            )}
          </>
        )}
      >
        {selectedRequest && (
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Producto" value={selectedRequest.producto?.nombre} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Socio" value={selectedRequest.socio_nombre || selectedRequest.socio_id} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Estado" value={statusLabel[selectedRequest.estado] || selectedRequest.estado} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailLine label="Descripción corta" value={selectedRequest.producto?.descripcion_corta} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <DetailLine label="Descripción larga" value={selectedRequest.producto?.descripcion_larga} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <DetailLine label="Variante" value={selectedRequest.variante?.nombre_variante || 'Estándar'} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <DetailLine label="Precio" value={formatCurrency(selectedRequest.variante?.precio || 0)} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <DetailLine label="Cantidad informada" value={selectedRequest.variante?.cantidad_disponible_socio ?? 'No indicada'} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <DetailLine
                  label="Precio comparación"
                  value={selectedRequest.variante?.precio_comparacion ? formatCurrency(selectedRequest.variante.precio_comparacion) : 'No indicado'}
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                Características seleccionadas
              </Typography>
              {selectedAttributeDetails.length > 0 ? (
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {selectedAttributeDetails.map((item) => (
                    <Chip
                      key={item.id}
                      size="small"
                      variant="outlined"
                      label={`${item.label}: ${item.value}`}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sin características seleccionadas.
                </Typography>
              )}
            </Box>

            {selectedRequest.multimedia?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Multimedia</Typography>
                <Grid container spacing={1.5}>
                  {selectedRequest.multimedia.map((media) => (
                    <Grid key={media.url_archivo} size={{ xs: 6, md: 3 }}>
                      <Box
                        component="img"
                        src={media.url_archivo}
                        alt={media.texto_alternativo || selectedRequest.producto?.nombre}
                        sx={(theme) => ({ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: theme.palette.custom.radius.xs })}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {selectedRequest.comentario_socio && (
              <Alert severity="info">Comentario del socio: {selectedRequest.comentario_socio}</Alert>
            )}

            {isReviewMode ? (
              <>
                <TextField
                  label="Comentario de revisión"
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  helperText="Este comentario será visible para el socio cuando revise el estado del producto."
                  fullWidth
                  multiline
                  minRows={2}
                />

                <TextField
                  label="Comisión Aliqora (%)"
                  type="number"
                  value={commissionPercent}
                  onChange={(event) => setCommissionPercent(event.target.value)}
                  helperText="Porcentaje que Aliqora retiene por gestión, venta y coordinación. La liquidación al socio será el restante."
                  fullWidth
                  slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
                />

                <Box
                  sx={(theme) => ({
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: theme.palette.custom.radius.xs,
                    p: 2,
                    bgcolor: 'background.default',
                  })}
                >
                  <Stack spacing={1.6}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Inventory2OutlinedIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" fontWeight={800}>
                        Operación comercial y disponibilidad
                      </Typography>
                    </Stack>

                    <Alert severity="info">
                      En el modelo por comisión, la ganancia de Aliqora se calcula por el porcentaje acordado. Si el socio conserva el producto, no registres stock en almacén.
                    </Alert>

                    {reviewError && <Alert severity="error">{reviewError}</Alert>}

                    <TextField
                      select
                      label="Modo de stock"
                      value={stockMode}
                      onChange={(event) => {
                        setStockMode(event.target.value);
                        setReviewError('');
                      }}
                      helperText={getStockModeHelper(stockMode)}
                      fullWidth
                    >
                      {stockModeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    {stockMode === 'bajo_pedido_socio' && (
                      <TextField
                        label="Cantidad máxima disponible"
                        type="number"
                        value={stockQuantity}
                        onChange={(event) => {
                          setStockQuantity(event.target.value);
                          setReviewError('');
                        }}
                        helperText="Cantidad confirmada por el socio. El cliente no podrá comprar más que este máximo."
                        fullWidth
                        slotProps={{ htmlInput: { min: 1, step: 1 } }}
                      />
                    )}

                    {stockMode === 'ingreso_almacen' && (
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 7 }}>
                          <Autocomplete
                            options={warehouses}
                            value={selectedWarehouse}
                            onChange={(event, value) => {
                              setWarehouseId(value?.id || '');
                              setReviewError('');
                            }}
                            getOptionLabel={(option) => option?.nombre || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderOption={(props, option) => {
                              const { key, ...optionProps } = props;

                              return (
                                <Box component="li" key={option.id || key} {...optionProps}>
                                  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                                    <Typography variant="body2" fontWeight={700} noWrap>
                                      {option.nombre || 'Almacén sin nombre'}
                                    </Typography>
                                    {option.descripcion && (
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                        {option.descripcion}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField {...params} label="Almacén de ingreso" placeholder="Buscar almacén" />
                            )}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <TextField
                            label="Cantidad a ingresar"
                            type="number"
                            value={stockQuantity}
                            onChange={(event) => {
                              setStockQuantity(event.target.value);
                              setReviewError('');
                            }}
                            fullWidth
                            slotProps={{ htmlInput: { min: 1, step: 1 } }}
                          />
                        </Grid>
                      </Grid>
                    )}

                    {stockMode === 'bajo_pedido_socio' && (
                      <Alert severity="warning">
                        No se creará movimiento de inventario. Se publicará con disponibilidad limitada y el sistema bloqueará cantidades mayores al stock informado.
                      </Alert>
                    )}

                    {stockMode === 'sin_ingreso' && (
                      <Alert severity="warning">
                        El producto quedará aprobado, pero sin disponibilidad operativa. Úsalo solo si falta confirmar condiciones con el socio.
                      </Alert>
                    )}
                  </Stack>
                </Box>
              </>
            ) : selectedRequest.comentario_revision ? (
              <Alert severity="info">Comentario de revisión: {selectedRequest.comentario_revision}</Alert>
            ) : null}
          </Stack>
        )}
      </AdminDialog>


      <AdminDialog
        open={Boolean(selectedCatalogProduct)}
        onClose={closeCommercialConditionsDialog}
        title="Editar condiciones comerciales"
        icon={<PercentOutlinedIcon />}
        maxWidth="sm"
        loading={updatingCommercialConditions}
        actions={(
          <>
            <Button onClick={closeCommercialConditionsDialog} disabled={updatingCommercialConditions}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveCommercialConditions}
              disabled={updatingCommercialConditions}
            >
              Guardar cambios
            </Button>
          </>
        )}
      >
        {selectedCatalogProduct && (
          <Stack spacing={2}>
            <Alert severity="info">
              Estos cambios aplican a ventas nuevas. Las ventas ya registradas mantienen la comisión guardada en el pedido.
            </Alert>

            {conditionsError && <Alert severity="error">{conditionsError}</Alert>}

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Producto" value={selectedCatalogProduct.nombre} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DetailLine label="Socio" value={selectedCatalogProduct.socio_nombre || selectedCatalogProduct.socio_comercial_id} />
              </Grid>
            </Grid>

            <TextField
              label="Comisión Aliqora (%)"
              type="number"
              value={conditionsForm.commissionPercent}
              onChange={(event) => handleConditionsChange('commissionPercent', event.target.value)}
              helperText="Porcentaje que Aliqora retiene por gestión, venta y operación. La liquidación al socio será el restante."
              fullWidth
              slotProps={{ htmlInput: { min: 0, max: 100, step: '0.01' } }}
            />

            <TextField
              select
              label="Estado en tienda"
              value={conditionsForm.status}
              onChange={(event) => handleConditionsChange('status', event.target.value)}
              helperText="Retirar de tienda conserva historial, pedidos y liquidaciones."
              fullWidth
            >
              <MenuItem value="activo">Publicado</MenuItem>
              <MenuItem value="retirado">Retirado de tienda</MenuItem>
            </TextField>
          </Stack>
        )}
      </AdminDialog>

      <ConfirmDialog
        open={Boolean(pendingReviewAction)}
        action={pendingReviewAction === 'aprobar' ? 'approve' : 'warning'}
        title={pendingReviewAction === 'aprobar' ? 'Aprobar producto de socio' : 'Rechazar producto de socio'}
        message={
          pendingReviewAction === 'aprobar'
            ? stockMode === 'ingreso_almacen'
              ? `¿Deseas aprobar este producto y registrar ${Number(stockQuantity) || 0} unidad(es) en custodia de Aliqora?`
              : stockMode === 'bajo_pedido_socio'
                ? `¿Deseas aprobar este producto con disponibilidad limitada de ${Number(stockQuantity) || 0} unidad(es)?`
                : '¿Deseas aprobar este producto sin disponibilidad inicial?'
            : '¿Deseas rechazar este producto? El socio verá el resultado en su seguimiento.'
        }
        confirmText={pendingReviewAction ? decisionLabel[pendingReviewAction] : 'Confirmar'}
        loading={saving}
        onCancel={() => setPendingReviewAction('')}
        onConfirm={handleReview}
      />
    </PlaceholderPage>
  );
};
