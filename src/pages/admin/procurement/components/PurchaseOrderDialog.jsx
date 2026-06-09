import { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { AppDatePicker } from '../../../../components/common/AppDatePicker';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { useSupplierProducts } from '../../../../hooks/procurement/useProcurement';
import { formatCurrency } from '../../../../utils/formatters';

const ORDER_STATES = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'confirmada', label: 'Confirmada' },
];

const initialForm = {
  id: '',
  proveedor_id: '',
  pedido_id: '',
  estado: 'borrador',
  fecha_estimada_recepcion: '',
  notas: '',
};

const buildEmptyItem = () => ({
  id: '',
  producto_id: '',
  variante_id: '',
  descripcion: '',
  cantidad: 1,
  costo_unitario: '',
});

const normalizeItems = (items = []) => {
  if (!items.length) return [buildEmptyItem()];

  return items.map((item) => ({
    ...buildEmptyItem(),
    ...item,
    cantidad: item.cantidad ?? 1,
    costo_unitario: item.costo_unitario ?? '',
  }));
};

const toNumber = (value, defaultValue = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : defaultValue;
};

const getFirstDefinedValue = (...values) => {
  return values.find((value) => value !== null && value !== undefined && value !== '');
};

export const PurchaseOrderDialog = ({
  open,
  initialData,
  suppliers = [],
  variants = [],
  saving,
  error,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(initialData || {}),
    proveedor_id: initialData?.proveedor_id || '',
    pedido_id: initialData?.pedido_id || '',
    fecha_estimada_recepcion: initialData?.fecha_estimada_recepcion || '',
    estado: ['borrador', 'enviada', 'confirmada'].includes(initialData?.estado)
      ? initialData.estado
      : 'borrador',
  }));
  const [items, setItems] = useState(() => normalizeItems(initialData?.items));
  const [localError, setLocalError] = useState('');
  const [removeItemIndex, setRemoveItemIndex] = useState(null);

  const {
    items: supplierProducts,
    loading: supplierProductsLoading,
    error: supplierProductsError,
  } = useSupplierProducts(form.proveedor_id, open && Boolean(form.proveedor_id));

  const variantById = useMemo(() => {
    return variants.reduce((acc, variant) => {
      acc[variant.id] = variant;
      return acc;
    }, {});
  }, [variants]);

  const getSupplierRuleByVariantId = (variantId) => {
    if (!variantId) return null;

    const selectedVariant = variantById[variantId];

    return (
      supplierProducts.find((item) => item.variante_id === variantId) ||
      supplierProducts.find(
        (item) => !item.variante_id && selectedVariant?.producto_id && item.producto_id === selectedVariant.producto_id
      ) ||
      null
    );
  };

  const getMinimumPurchaseQuantity = (variantId) => {
    const supplierRule = getSupplierRuleByVariantId(variantId);
    return Math.max(toNumber(supplierRule?.compra_minima, 1), 1);
  };

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.cantidad || 0) * Number(item.costo_unitario || 0), 0);
  }, [items]);
  const selectedSupplier = useMemo(
    () => suppliers.find((supplier) => supplier.id === form.proveedor_id) || null,
    [form.proveedor_id, suppliers]
  );

  const updateForm = (field, value) => {
    setLocalError('');

    setForm((current) => ({ ...current, [field]: value }));

    // Al cambiar de proveedor se limpian los productos para evitar usar costos o mínimos
    // configurados para otro proveedor.
    if (field === 'proveedor_id') {
      setItems([buildEmptyItem()]);
    }
  };

  const updateItem = (index, field, value) => {
    setLocalError('');

    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'variante_id') {
          const selectedVariant = variantById[value];
          const supplierRule = getSupplierRuleByVariantId(value);
          const minimumPurchaseQuantity = Math.max(toNumber(supplierRule?.compra_minima, 1), 1);
          const currentQuantity = Math.max(toNumber(item.cantidad, 1), 1);

          return {
            ...item,
            variante_id: value,
            producto_id: selectedVariant?.producto_id || '',
            descripcion: selectedVariant?.label || item.descripcion,
            cantidad: Math.max(currentQuantity, minimumPurchaseQuantity),
            costo_unitario: getFirstDefinedValue(
              supplierRule?.costo_compra,
              item.costo_unitario,
              selectedVariant?.costo_compra_sugerido,
              selectedVariant?.costo_actual,
              0
            ),
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

    if (!form.proveedor_id) {
      setLocalError('Selecciona el proveedor de la orden de compra.');
      return;
    }

    const payloadItems = items
      .filter((item) => item.variante_id || item.descripcion?.trim())
      .map((item) => ({
        id: item.id || undefined,
        producto_id: item.producto_id || null,
        variante_id: item.variante_id || null,
        descripcion: item.descripcion?.trim() || null,
        cantidad: Number(item.cantidad || 0),
        costo_unitario: Number(item.costo_unitario || 0),
      }));

    if (!payloadItems.length) {
      setLocalError('Agrega al menos un producto a la orden.');
      return;
    }

    if (payloadItems.some((item) => item.cantidad <= 0)) {
      setLocalError('La cantidad de cada producto debe ser mayor a cero.');
      return;
    }

    const invalidMinimumItem = payloadItems.find((item) => {
      const minimumPurchaseQuantity = getMinimumPurchaseQuantity(item.variante_id);
      return item.variante_id && item.cantidad < minimumPurchaseQuantity;
    });

    if (invalidMinimumItem) {
      const minimumPurchaseQuantity = getMinimumPurchaseQuantity(invalidMinimumItem.variante_id);
      setLocalError(
        `La variante "${invalidMinimumItem.descripcion || 'seleccionada'}" tiene una cantidad mínima de compra de ${minimumPurchaseQuantity} unidades para este proveedor.`
      );
      return;
    }

    onSubmit?.({
      order: {
        ...form,
        pedido_id: form.pedido_id || null,
        fecha_estimada_recepcion: form.fecha_estimada_recepcion || null,
        notas: form.notas?.trim() || null,
      },
      items: payloadItems,
    });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle sx={{ pr: 6, fontWeight: 900 }}>
          {form.id ? 'Editar orden de compra' : 'Nueva orden de compra'}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
            aria-label="Cerrar"
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info">
              La orden de compra registra lo que pedirás al proveedor. El stock recién aumenta cuando registres la recepción de mercadería.
            </Alert>
            <ErrorMessage message={localError || error || supplierProductsError} />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Autocomplete
                options={suppliers}
                value={selectedSupplier}
                onChange={(_event, value) => updateForm('proveedor_id', value?.id || '')}
                getOptionLabel={(option) => option?.razon_social || option?.nombre_comercial || ''}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                noOptionsText="No se encontraron proveedores"
                sx={{ flex: 1 }}
                renderInput={(params) => (
                  <TextField {...params} required label="Proveedor" placeholder="Busca proveedor" />
                )}
              />

              <TextField
                select
                label="Estado inicial"
                value={form.estado}
                onChange={(event) => updateForm('estado', event.target.value)}
                sx={{ width: { xs: '100%', md: 190 } }}
              >
                {ORDER_STATES.map((state) => (
                  <MenuItem key={state.value} value={state.value}>
                    {state.label}
                  </MenuItem>
                ))}
              </TextField>

              <AppDatePicker
                label="Recepción estimada"
                value={form.fecha_estimada_recepcion}
                onChange={(value) => updateForm('fecha_estimada_recepcion', value)}
                width={190}
              />
            </Stack>

            <TextField
              multiline
              minRows={2}
              label="Notas de compra"
              value={form.notas || ''}
              onChange={(event) => updateForm('notas', event.target.value)}
            />

            <Stack spacing={1.5}>
              <Typography variant="subtitle2" fontWeight={900}>
                Productos solicitados
              </Typography>

              {items.map((item, index) => {
                const selectedVariant = variantById[item.variante_id];
                const supplierRule = getSupplierRuleByVariantId(item.variante_id);
                const minimumPurchaseQuantity = getMinimumPurchaseQuantity(item.variante_id);
                const lineTotal = Number(item.cantidad || 0) * Number(item.costo_unitario || 0);

                return (
                  <Paper key={`${item.id || 'new'}-${index}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      spacing={1.25}
                      sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
                    >
                      <Autocomplete
                        size="small"
                        options={variants}
                        value={selectedVariant || null}
                        onChange={(_event, value) => updateItem(index, 'variante_id', value?.id || '')}
                        getOptionLabel={(option) => option?.label || ''}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        disabled={!form.proveedor_id || supplierProductsLoading}
                        noOptionsText="No se encontraron variantes"
                        sx={{ minWidth: { xs: '100%', md: 330 }, flex: 1 }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Variante"
                            placeholder="Busca producto, codigo o variante"
                            helperText={!form.proveedor_id ? 'Primero selecciona un proveedor.' : ''}
                          />
                        )}
                      />

                      <TextField
                        size="small"
                        label="Cantidad"
                        type="number"
                        value={item.cantidad}
                        onChange={(event) => updateItem(index, 'cantidad', event.target.value)}
                        helperText={item.variante_id && minimumPurchaseQuantity > 1 ? `Mín. compra: ${minimumPurchaseQuantity}` : ''}
                        slotProps={{
                          htmlInput: {
                            min: minimumPurchaseQuantity,
                            step: 1,
                          },
                        }}
                        sx={{ width: { xs: '100%', md: 135 } }}
                      />

                      <TextField
                        size="small"
                        label="Costo unitario"
                        type="number"
                        value={item.costo_unitario}
                        onChange={(event) => updateItem(index, 'costo_unitario', event.target.value)}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            step: '0.01',
                          },
                        }}
                        sx={{ width: { xs: '100%', md: 145 } }}
                      />

                      <Box sx={{ minWidth: { xs: '100%', md: 120 } }}>
                        <Typography variant="caption" color="text.secondary">
                          Total línea
                        </Typography>
                        <Typography variant="body2" fontWeight={900}>
                          {formatCurrency(lineTotal)}
                        </Typography>
                      </Box>

                      <IconButton
                        color="error"
                        onClick={() => requestRemoveItem(index)}
                        disabled={items.length === 1}
                        aria-label="Quitar producto"
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>

                    {selectedVariant && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {Number(selectedVariant.stock_total_actual || 0) > 0
                          ? `Stock actual: ${selectedVariant.stock_total_actual} unidades · Costo promedio actual: ${formatCurrency(selectedVariant.costo_actual)}`
                          : 'Sin stock actual · Costo promedio actual: no aplica'}{' '}
                        · Costo proveedor: {formatCurrency(supplierRule?.costo_compra ?? selectedVariant.costo_compra_sugerido)} · Mín. compra:{' '}
                        {minimumPurchaseQuantity} unidades
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => setItems((current) => [...current, buildEmptyItem()])}
              >
                Agregar producto
              </Button>

              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="caption" color="text.secondary">
                  Total estimado de compra
                </Typography>
                <Typography variant="h6" fontWeight={900}>
                  {formatCurrency(total)}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            Guardar orden
          </Button>
        </DialogActions>
      </Box>
      </Dialog>

      <ConfirmDialog
        open={removeItemIndex !== null}
        action="delete"
        title="Quitar producto"
        message="¿Deseas quitar este producto de la orden de compra?"
        confirmText="Quitar"
        onCancel={() => setRemoveItemIndex(null)}
        onConfirm={handleConfirmRemoveItem}
      />
    </>
  );
};
