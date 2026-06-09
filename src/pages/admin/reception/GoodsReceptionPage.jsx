// Página administrativa: Recepción de mercadería.
// Registra ingresos reales desde compras/proveedores y actualiza inventario con costo promedio ponderado.

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { AdminResourceTable } from '../../../components/common/dataTable/AdminResourceTable';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { PlaceholderPage } from '../../../components/common/PlaceholderPage';
import {
  useGoodsReceptionsAdmin,
  usePendingPurchaseOrders,
  useProcurementOptions,
} from '../../../hooks/procurement/useProcurement';
import { getGoodsReceptionDetail, getPurchaseOrderDetail } from '../../../services/procurement/procurementService';
import { normalizeApiError } from '../../../utils/api/normalizeApiError';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { CancelReceptionDialog } from './components/CancelReceptionDialog';
import { GoodsReceptionDetailDialog } from './components/GoodsReceptionDetailDialog';
import { AdminDialog } from '../../../components/common/adminDialog/AdminDialog';

const STATUS_OPTIONS = [
  { value: 'parcial', label: 'Parcial' },
  { value: 'completa', label: 'Completa' },
  { value: 'anulada', label: 'Anulada' },
];

const STATUS_COLOR = {
  parcial: 'secondary',
  completa: 'success',
  anulada: 'error',
};

const getStatusLabel = (value) => STATUS_OPTIONS.find((option) => option.value === value)?.label || value || '-';

const initialReceptionForm = {
  orden_compra_id: '',
  proveedor_id: '',
  almacen_id: '',
  documento_referencia: '',
  observaciones: '',
};

const buildEmptyReceptionItem = () => ({
  orden_compra_item_id: '',
  producto_id: '',
  variante_id: '',
  variante_label: '',
  cantidad_pendiente: 0,
  cantidad_recibida: 1,
  costo_unitario: '',
  observaciones: '',
});

const normalizeReceptionOrderItems = (order) => {
  return (order?.items || [])
    .filter((item) => Number(item.cantidad_pendiente || 0) > 0)
    .map((item) => ({
      orden_compra_item_id: item.id,
      producto_id: item.producto_id || '',
      variante_id: item.variante_id || '',
      variante_label: item.variante_label || item.descripcion || '',
      cantidad_pendiente: Number(item.cantidad_pendiente || 0),
      cantidad_recibida: Number(item.cantidad_pendiente || 0),
      costo_unitario: Number(item.costo_unitario || 0),
      observaciones: '',
    }));
};

export const GoodsReceptionPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ estado: '' });
  const [formOpen, setFormOpen] = useState(false);
  const [receptionForm, setReceptionForm] = useState(initialReceptionForm);
  const [receptionItems, setReceptionItems] = useState([buildEmptyReceptionItem()]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReception, setSelectedReception] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [notice, setNotice] = useState('');

  const { proveedores, almacenes, variantes } = useProcurementOptions('');
  const { orders: pendingOrders } = usePendingPurchaseOrders('', formOpen);

  const {
    rows,
    pagination,
    loading,
    fetching,
    saving,
    error,
    registerReception,
    cancelReception,
  } = useGoodsReceptionsAdmin({
    pageNumber,
    pageSize,
    search,
    estado: filters.estado,
  });

  const variantById = useMemo(() => {
    return variantes.reduce((acc, variant) => {
      acc[variant.id] = variant;
      return acc;
    }, {});
  }, [variantes]);

  const receptionTotal = useMemo(() => {
    return receptionItems.reduce((sum, item) => {
      return sum + Number(item.cantidad_recibida || 0) * Number(item.costo_unitario || 0);
    }, 0);
  }, [receptionItems]);

  const handleRegisterReception = async (payload) => {
    setLocalError('');

    try {
      await registerReception(payload);
      setLocalError('');
      setNotice('Recepción registrada. Stock y costo promedio actualizados.');
      setFormOpen(false);
      setReceptionForm(initialReceptionForm);
      setReceptionItems([buildEmptyReceptionItem()]);
      setSelectedOrder(null);
      setLoadingOrder(false);
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo registrar la recepción.');
    }
  };

  const resetReceptionForm = () => {
    setReceptionForm(initialReceptionForm);
    setReceptionItems([buildEmptyReceptionItem()]);
    setSelectedOrder(null);
    setLoadingOrder(false);
    setLocalError('');
  };

  const updateReceptionForm = (field, value) => {
    setReceptionForm((current) => ({ ...current, [field]: value }));
  };

  const handleSelectReceptionOrder = async (orderId) => {
    updateReceptionForm('orden_compra_id', orderId);
    setSelectedOrder(null);
    setLocalError('');

    if (!orderId) {
      setReceptionItems([buildEmptyReceptionItem()]);
      return;
    }

    setLoadingOrder(true);
    try {
      const detail = await getPurchaseOrderDetail(orderId);
      setSelectedOrder(detail);
      setReceptionForm((current) => ({
        ...current,
        orden_compra_id: orderId,
        proveedor_id: detail.proveedor_id || '',
      }));
      setReceptionItems(normalizeReceptionOrderItems(detail));
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo cargar la orden de compra.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const updateReceptionItem = (index, field, value) => {
    setReceptionItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'variante_id') {
          const selectedVariant = variantById[value];
          return {
            ...item,
            variante_id: value,
            producto_id: selectedVariant?.producto_id || '',
            variante_label: selectedVariant?.label || '',
            costo_unitario: item.costo_unitario || selectedVariant?.costo_compra_sugerido || selectedVariant?.costo_actual || 0,
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const removeReceptionItem = (index) => {
    setReceptionItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleReceptionFormSubmit = (event) => {
    event.preventDefault();

    if (!receptionForm.almacen_id) {
      setLocalError('Selecciona el almacén donde ingresará la mercadería.');
      return;
    }

    if (!receptionForm.orden_compra_id && !receptionForm.proveedor_id) {
      setLocalError('Selecciona una orden de compra o un proveedor para la recepción manual.');
      return;
    }

    const payloadItems = receptionItems
      .filter((item) => item.variante_id && Number(item.cantidad_recibida || 0) > 0)
      .map((item) => ({
        orden_compra_item_id: item.orden_compra_item_id || null,
        producto_id: item.producto_id || null,
        variante_id: item.variante_id,
        cantidad_recibida: Number(item.cantidad_recibida || 0),
        costo_unitario: Number(item.costo_unitario || 0),
        observaciones: item.observaciones?.trim() || null,
      }));

    if (!payloadItems.length) {
      setLocalError('Agrega al menos una cantidad recibida.');
      return;
    }

    const exceedsPending = receptionItems.some((item) => {
      if (!item.orden_compra_item_id) return false;
      return Number(item.cantidad_recibida || 0) > Number(item.cantidad_pendiente || 0);
    });

    if (exceedsPending) {
      setLocalError('La cantidad recibida no puede ser mayor a la cantidad pendiente de la orden.');
      return;
    }

    handleRegisterReception({
      reception: {
        ...receptionForm,
        proveedor_id: receptionForm.proveedor_id || null,
        orden_compra_id: receptionForm.orden_compra_id || null,
        documento_referencia: receptionForm.documento_referencia?.trim() || null,
        observaciones: receptionForm.observaciones?.trim() || null,
      },
      items: payloadItems,
    });
  };

  const handleView = async (row) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setLocalError('');

    try {
      const detail = await getGoodsReceptionDetail(row.id);
      setSelectedReception(detail);
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo cargar el detalle de recepción.');
    } finally {
      setDetailLoading(false);
    }
  };


  const handleOpenCancel = (row) => {
    setLocalError('');
    setCancelError('');
    setCancelTarget(row);
  };

  const handleCancelReception = async ({ receptionId, motivoAnulacion }) => {
    setCancelError('');

    try {
      await cancelReception({ receptionId, motivoAnulacion });
      setCancelTarget(null);
      setNotice('Recepción anulada. Stock, orden de compra y costo promedio fueron actualizados.');
    } catch (err) {
      setCancelError(normalizeApiError(err) || 'No se pudo anular la recepción.');
      throw err;
    }
  };

  return (
    <PlaceholderPage
      title="Recepción de mercadería"
      description="Registra lo recibido físicamente, genera entrada de inventario y recalcula el costo promedio para utilidad y márgenes."
    >
      <Stack spacing={2}>
        <ErrorMessage message={error || localError} />
        {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

        <AdminResourceTable
          rows={rows}
          columns={[
            {
              field: 'codigo_recepcion',
              headerName: 'Recepción',
              width: 165,
              renderCell: (row) => <Typography variant="caption" fontWeight={900}>{row.codigo_recepcion}</Typography>,
            },
            { field: 'numero_orden', headerName: 'Orden compra', width: 155, emptyText: 'Manual' },
            { field: 'proveedor_nombre', headerName: 'Proveedor', width: 220, emptyText: '-' },
            { field: 'almacen_nombre', headerName: 'Almacén', width: 170, emptyText: '-' },
            { field: 'documento_referencia', headerName: 'Documento', width: 165, emptyText: '-' },
            {
              field: 'estado',
              headerName: 'Estado',
              width: 145,
              renderCell: (row) => (
                <Chip
                  size="small"
                  label={getStatusLabel(row.estado)}
                  color={STATUS_COLOR[row.estado] || 'default'}
                  variant="outlined"
                />
              ),
            },
            { field: 'cantidad_recibida', headerName: 'Cantidad', width: 105 },
            { field: 'costo_total', headerName: 'Costo recibido', width: 140, renderCell: (row) => formatCurrency(row.costo_total) },
            { field: 'created_at', headerName: 'Fecha', width: 150, renderCell: (row) => formatDate(row.created_at) },
          ]}
          actions={[
            { type: 'view', label: 'Ver detalle', onClick: handleView },
            {
              type: 'cancel',
              label: 'Anular recepción',
              disabled: (row) => row.estado === 'anulada',
              onClick: handleOpenCancel,
            },
          ]}
          loading={loading || fetching || saving || detailLoading}
          pagination={pagination}
          searchValue={search}
          searchLabel="Buscar recepción"
          filters={[{ name: 'estado', label: 'Estado', type: 'select', width: 190, options: STATUS_OPTIONS }]}
          filterValues={filters}
          onSearchChange={(value) => {
            setSearch(value);
            setPageNumber(1);
          }}
          onFilterChange={(name, value) => {
            setFilters((current) => ({ ...current, [name]: value }));
            setPageNumber(1);
          }}
          onResetFilters={() => {
            setSearch('');
            setFilters({ estado: '' });
            setPageNumber(1);
          }}
          onPageChange={setPageNumber}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPageNumber(1);
          }}
          primaryActionLabel="Nueva recepción"
          onPrimaryAction={() => {
            resetReceptionForm();
            setFormOpen(true);
          }}
          emptyTitle="Sin recepciones"
          emptyDescription="Aquí aparecerán las entradas reales de mercadería desde proveedores."
          maxHeight={560}
        />
      </Stack>

      {formOpen && (
        <AdminDialog
          open={formOpen}
          title="Recepción"
          children={
            <>
              <Stack spacing={2}>
              <Alert severity="success">
                Al guardar, el sistema crea el movimiento de entrada, aumenta stock, actualiza cantidades recibidas y recalcula el costo promedio de la variante.
              </Alert>

              <ErrorMessage message={localError || error} />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Orden de compra"
                  value={receptionForm.orden_compra_id}
                  onChange={(event) => handleSelectReceptionOrder(event.target.value)}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="">Recepción manual sin orden</MenuItem>
                  {pendingOrders.map((order) => (
                    <MenuItem key={order.id} value={order.id}>
                      {order.numero_orden} · {order.proveedor_nombre} · Pendiente: {order.cantidad_pendiente}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  required={!receptionForm.orden_compra_id}
                  disabled={Boolean(receptionForm.orden_compra_id)}
                  label="Proveedor"
                  value={receptionForm.proveedor_id}
                  onChange={(event) => updateReceptionForm('proveedor_id', event.target.value)}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="">Seleccionar proveedor</MenuItem>
                  {proveedores.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.razon_social}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  required
                  label="Almacén destino"
                  value={receptionForm.almacen_id}
                  onChange={(event) => updateReceptionForm('almacen_id', event.target.value)}
                  sx={{ flex: 1 }}
                >
                  <MenuItem value="">Seleccionar almacén</MenuItem>
                  {almacenes.map((warehouse) => (
                    <MenuItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  label="Documento referencia"
                  placeholder="Factura, guía, boleta, nota de ingreso..."
                  value={receptionForm.documento_referencia}
                  onChange={(event) => updateReceptionForm('documento_referencia', event.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Observaciones"
                  value={receptionForm.observaciones}
                  onChange={(event) => updateReceptionForm('observaciones', event.target.value)}
                  sx={{ flex: 1 }}
                />
              </Stack>

              {loadingOrder && (
                <Stack sx={{ py: 2, alignItems: 'center' }}>
                  <CircularProgress size={28} />
                </Stack>
              )}

              {selectedOrder && (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={900}>
                    {selectedOrder.numero_orden} · {selectedOrder.proveedor_nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Solo se muestran cantidades pendientes de recibir.
                  </Typography>
                </Paper>
              )}

              <Stack spacing={1.5}>
                <Typography variant="subtitle2" fontWeight={900}>
                  Productos recibidos
                </Typography>

                {receptionItems.map((item, index) => {
                  const lineTotal = Number(item.cantidad_recibida || 0) * Number(item.costo_unitario || 0);

                  return (
                    <Paper key={`${item.orden_compra_item_id || item.variante_id || 'new'}-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.25}
                        sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
                      >
                        {item.orden_compra_item_id ? (
                          <Box sx={{ minWidth: { xs: '100%', md: 340 }, flex: 1 }}>
                            <Typography variant="body2" fontWeight={900}>{item.variante_label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Pendiente: {item.cantidad_pendiente}
                            </Typography>
                          </Box>
                        ) : (
                          <TextField
                            select
                            size="small"
                            label="Variante"
                            value={item.variante_id || ''}
                            onChange={(event) => updateReceptionItem(index, 'variante_id', event.target.value)}
                            sx={{ minWidth: { xs: '100%', md: 340 }, flex: 1 }}
                          >
                            <MenuItem value="">Seleccionar</MenuItem>
                            {variantes.map((variant) => (
                              <MenuItem key={variant.id} value={variant.id}>
                                {variant.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}

                        <TextField
                          size="small"
                          label="Cant. recibida"
                          type="number"
                          value={item.cantidad_recibida}
                          onChange={(event) => updateReceptionItem(index, 'cantidad_recibida', event.target.value)}
                          sx={{ width: { xs: '100%', md: 135 } }}
                        />

                        <TextField
                          size="small"
                          label="Costo unitario"
                          type="number"
                          value={item.costo_unitario}
                          onChange={(event) => updateReceptionItem(index, 'costo_unitario', event.target.value)}
                          sx={{ width: { xs: '100%', md: 145 } }}
                        />

                        <Box sx={{ minWidth: { xs: '100%', md: 120 } }}>
                          <Typography variant="caption" color="text.secondary">Total línea</Typography>
                          <Typography variant="body2" fontWeight={900}>{formatCurrency(lineTotal)}</Typography>
                        </Box>

                        <IconButton
                          color="error"
                          onClick={() => removeReceptionItem(index)}
                          disabled={receptionItems.length === 1 && Boolean(receptionForm.orden_compra_id)}
                          aria-label="Quitar producto"
                        >
                          <DeleteOutlineRoundedIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>

              {!receptionForm.orden_compra_id && (
                <Button
                  variant="outlined"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setReceptionItems((current) => [...current, buildEmptyReceptionItem()])}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Agregar producto manual
                </Button>
              )}

              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="caption" color="text.secondary">Costo total recibido</Typography>
                <Typography variant="h6" fontWeight={900}>{formatCurrency(receptionTotal)}</Typography>
              </Box>
            </Stack>
            </>
          }
          onClose={() => {
            setFormOpen(false);
            resetReceptionForm();
          }}
          onSubmit={handleReceptionFormSubmit}
          maxWidth="lg"
          loading={saving || loadingOrder}
          actions={(
            <>
              <Button
                variant="outlined"
                onClick={() => {
                  setFormOpen(false);
                  resetReceptionForm();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={saving || loadingOrder}>
                Registrar recepción
              </Button>
            </>
          )}
        />
      )}

      <CancelReceptionDialog
        open={Boolean(cancelTarget)}
        reception={cancelTarget}
        loading={saving}
        error={cancelError}
        onClose={() => {
          setCancelTarget(null);
          setCancelError('');
        }}
        onConfirm={handleCancelReception}
      />

      <AdminDialog
        open={detailOpen}
        title="Detalle de recepción"
        children={
          <>
            {detailLoading && (
              <Stack sx={{ py: 4, alignItems: 'center' }}>
                <CircularProgress size={28} />
              </Stack>
            )}

            {!detailLoading && <ErrorMessage message={localError} />}

            {!detailLoading && selectedReception && (
              <Stack spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">Recepción</Typography>
                      <Typography variant="h6" fontWeight={900}>{selectedReception.codigo_recepcion}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Orden</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedReception.numero_orden || 'Manual'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Proveedor</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedReception.proveedor_nombre || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Almacén</Typography>
                      <Typography variant="body2" fontWeight={800}>{selectedReception.almacen_nombre || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Estado</Typography>
                      <Box><Chip size="small" label={getStatusLabel(selectedReception.estado) || selectedReception.estado} variant="outlined" color={STATUS_COLOR[selectedReception.estado] || 'default'} /></Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Fecha</Typography>
                      <Typography variant="body2" fontWeight={800}>{formatDate(selectedReception.created_at)}</Typography>
                    </Box>
                  </Stack>
                </Paper>

                {(selectedReception.documento_referencia || selectedReception.observaciones) && (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight={900}>Documento / observaciones</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedReception.documento_referencia || 'Sin documento'} {selectedReception.observaciones ? `· ${selectedReception.observaciones}` : ''}
                    </Typography>
                  </Paper>
                )}

                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto / variante</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Costo unit.</TableCell>
                        <TableCell align="right">Costo total</TableCell>
                        <TableCell>Observación</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(selectedReception.items || []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={800}>{item.variante_label || item.producto_nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.codigoproducto || '-'}</Typography>
                          </TableCell>
                          <TableCell align="right">{item.cantidad_recibida}</TableCell>
                          <TableCell align="right">{formatCurrency(item.costo_unitario)}</TableCell>
                          <TableCell align="right">{formatCurrency(item.costo_total)}</TableCell>
                          <TableCell>{item.observaciones || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Stack>
            )}
          </>
        }
        onClose={() => {
          setDetailOpen(false);
          setLocalError('');
        }}
        maxWidth="lg"
      >
        
      </AdminDialog>
    </PlaceholderPage>
  );
};
