import { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';
import { AdminDialog } from '../../../../components/common/adminDialog/AdminDialog';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { getPurchaseOrderDetail } from '../../../../services/procurement/procurementService';
import { normalizeApiError } from '../../../../utils/api/normalizeApiError';
import { formatCurrency } from '../../../../utils/formatters';

const initialForm = {
  orden_compra_id: '',
  proveedor_id: '',
  almacen_id: '',
  documento_referencia: '',
  observaciones: '',
};

const buildEmptyItem = () => ({
  orden_compra_item_id: '',
  producto_id: '',
  variante_id: '',
  variante_label: '',
  cantidad_pendiente: 0,
  cantidad_recibida: 1,
  costo_unitario: '',
  observaciones: '',
});

const normalizeOrderItems = (order) => {
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

export const GoodsReceptionDialog = ({
  open,
  pendingOrders = [],
  suppliers = [],
  warehouses = [],
  variants = [],
  variantsLoading = false,
  saving,
  error,
  onClose,
  onSubmit,
  onVariantSearchChange,
}) => {
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([buildEmptyItem()]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [localError, setLocalError] = useState('');
  const [removeItemIndex, setRemoveItemIndex] = useState(null);

  const variantById = useMemo(() => {
    return variants.reduce((acc, variant) => {
      acc[variant.id] = variant;
      return acc;
    }, {});
  }, [variants]);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.cantidad_recibida || 0) * Number(item.costo_unitario || 0);
    }, 0);
  }, [items]);

  const getVariantLabel = (variant) => {
    if (!variant) return '';

    return variant.label || [
      variant.producto_nombre,
      variant.nombre_variante,
      variant.etiqueta_medida,
      variant.codigoproducto,
    ].filter(Boolean).join(' · ') || 'Variante';
  };

  const getSelectedVariantOption = (item) => {
    if (!item?.variante_id) return null;

    return variantById[item.variante_id] || {
      id: item.variante_id,
      producto_id: item.producto_id,
      label: item.variante_label || 'Variante seleccionada',
    };
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSelectOrder = async (orderId) => {
    updateForm('orden_compra_id', orderId);
    setSelectedOrder(null);
    setLocalError('');

    if (!orderId) {
      setItems([buildEmptyItem()]);
      return;
    }

    setLoadingOrder(true);
    try {
      const detail = await getPurchaseOrderDetail(orderId);
      setSelectedOrder(detail);
      setForm((current) => ({
        ...current,
        orden_compra_id: orderId,
        proveedor_id: detail.proveedor_id || '',
      }));
      setItems(normalizeOrderItems(detail));
    } catch (err) {
      setLocalError(normalizeApiError(err) || 'No se pudo cargar la orden de compra.');
    } finally {
      setLoadingOrder(false);
    }
  };

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'variante_id') {
          const selectedVariant = variantById[value];
          return {
            ...item,
            variante_id: value,
            producto_id: selectedVariant?.producto_id || '',
            variante_label: getVariantLabel(selectedVariant),
            costo_unitario: item.costo_unitario || selectedVariant?.costo_compra_sugerido || selectedVariant?.costo_actual || 0,
          };
        }

        return { ...item, [field]: value };
      })
    );
  };

  const requestRemoveItem = (index) => {
    setRemoveItemIndex(index);
  };

  const handleConfirmRemoveItem = () => {
    if (removeItemIndex === null) return;

    setItems((current) => current.filter((_, itemIndex) => itemIndex !== removeItemIndex));
    setRemoveItemIndex(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.almacen_id) {
      setLocalError('Selecciona el almacén donde ingresará la mercadería.');
      return;
    }

    if (!form.orden_compra_id && !form.proveedor_id) {
      setLocalError('Selecciona una orden de compra o un proveedor para la recepción manual.');
      return;
    }

    const payloadItems = items
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

    const exceedsPending = items.some((item) => {
      if (!item.orden_compra_item_id) return false;
      return Number(item.cantidad_recibida || 0) > Number(item.cantidad_pendiente || 0);
    });

    if (exceedsPending) {
      setLocalError('La cantidad recibida no puede ser mayor a la cantidad pendiente de la orden.');
      return;
    }

    onSubmit?.({
      reception: {
        ...form,
        proveedor_id: form.proveedor_id || null,
        orden_compra_id: form.orden_compra_id || null,
        documento_referencia: form.documento_referencia?.trim() || null,
        observaciones: form.observaciones?.trim() || null,
      },
      items: payloadItems,
    });
  };

  return (
    <>
      <AdminDialog
        open={open}
        onClose={onClose}
        title="Nueva recepción de mercadería"
        icon={<Inventory2OutlinedIcon />}
        maxWidth="lg"
        loading={saving || loadingOrder}
        onSubmit={handleSubmit}
        actions={(
          <>
            <Button variant="outlined" onClick={onClose} disabled={saving || loadingOrder}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={saving || loadingOrder}>
              Registrar recepción
            </Button>
          </>
        )}
      >
          <Stack spacing={2}>
            <Alert severity="success">
              Al guardar, el sistema crea el movimiento de entrada, aumenta stock, actualiza cantidades recibidas y recalcula el costo promedio de la variante.
            </Alert>

            <ErrorMessage message={localError || error} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                select
                label="Orden de compra"
                value={form.orden_compra_id}
                onChange={(event) => handleSelectOrder(event.target.value)}
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
                required={!form.orden_compra_id}
                disabled={Boolean(form.orden_compra_id)}
                label="Proveedor"
                value={form.proveedor_id}
                onChange={(event) => updateForm('proveedor_id', event.target.value)}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Seleccionar proveedor</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.razon_social}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                required
                label="Almacén destino"
                value={form.almacen_id}
                onChange={(event) => updateForm('almacen_id', event.target.value)}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Seleccionar almacén</MenuItem>
                {warehouses.map((warehouse) => (
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
                value={form.documento_referencia}
                onChange={(event) => updateForm('documento_referencia', event.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Observaciones"
                value={form.observaciones}
                onChange={(event) => updateForm('observaciones', event.target.value)}
                sx={{ flex: 1 }}
              />
            </Stack>

            {loadingOrder && (
              <Stack sx={{ py: 2, alignItems: 'center' }}>
                <CircularProgress size={28} />
              </Stack>
            )}

            {selectedOrder && (
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: (theme) => theme.palette.custom.radius.xs }}>
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

              {items.map((item, index) => {
                const lineTotal = Number(item.cantidad_recibida || 0) * Number(item.costo_unitario || 0);

                return (
                  <Paper key={`${item.orden_compra_item_id || item.variante_id || 'new'}-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: (theme) => theme.palette.custom.radius.xs }}>
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
                        <Autocomplete
                          size="small"
                          options={variants}
                          loading={variantsLoading}
                          value={getSelectedVariantOption(item)}
                          inputValue={item.variante_label || ''}
                          getOptionLabel={getVariantLabel}
                          isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
                          filterOptions={(options) => options}
                          noOptionsText="Escribe para buscar una variante"
                          loadingText="Buscando variantes..."
                          onInputChange={(_, value, reason) => {
                            if (reason === 'input' || reason === 'clear') {
                              setItems((current) =>
                                current.map((currentItem, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...currentItem,
                                        variante_id: '',
                                        producto_id: '',
                                        variante_label: value,
                                      }
                                    : currentItem
                                )
                              );
                              onVariantSearchChange?.(value);
                            }
                          }}
                          onChange={(_, selectedVariant) => {
                            updateItem(index, 'variante_id', selectedVariant?.id || '');
                            if (!selectedVariant) {
                              updateItem(index, 'variante_label', '');
                              onVariantSearchChange?.('');
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Variante"
                              placeholder="Buscar por producto, código o medida"
                              helperText="Escribe y selecciona una recomendación."
                            />
                          )}
                          sx={{ minWidth: { xs: '100%', md: 360 }, flex: 1 }}
                        />
                      )}

                      <TextField
                        size="small"
                        label="Cant. recibida"
                        type="number"
                        value={item.cantidad_recibida}
                        onChange={(event) => updateItem(index, 'cantidad_recibida', event.target.value)}
                        sx={{ width: { xs: '100%', md: 135 } }}
                      />

                      <TextField
                        size="small"
                        label="Costo unitario"
                        type="number"
                        value={item.costo_unitario}
                        onChange={(event) => updateItem(index, 'costo_unitario', event.target.value)}
                        sx={{ width: { xs: '100%', md: 145 } }}
                      />

                      <Box sx={{ minWidth: { xs: '100%', md: 120 } }}>
                        <Typography variant="caption" color="text.secondary">Total línea</Typography>
                        <Typography variant="body2" fontWeight={900}>{formatCurrency(lineTotal)}</Typography>
                      </Box>

                      <IconButton
                        color="error"
                        onClick={() => requestRemoveItem(index)}
                        disabled={items.length === 1 && Boolean(form.orden_compra_id)}
                        aria-label="Quitar producto"
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            {!form.orden_compra_id && (
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setItems((current) => [...current, buildEmptyItem()])}
                sx={{ alignSelf: 'flex-start' }}
              >
                Agregar producto manual
              </Button>
            )}

            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="caption" color="text.secondary">Costo total recibido</Typography>
              <Typography variant="h6" fontWeight={900}>{formatCurrency(total)}</Typography>
            </Box>
          </Stack>
      </AdminDialog>

      <ConfirmDialog
        open={removeItemIndex !== null}
        action="delete"
        title="Quitar producto"
        message="¿Deseas quitar este producto de la recepción?"
        confirmText="Quitar"
        onCancel={() => setRemoveItemIndex(null)}
        onConfirm={handleConfirmRemoveItem}
      />
    </>
  );
};
