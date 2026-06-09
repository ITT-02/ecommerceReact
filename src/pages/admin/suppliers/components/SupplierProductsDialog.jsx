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

import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';
import { ErrorMessage } from '../../../../components/common/ErrorMessage';
import { formatCurrency } from '../../../../utils/formatters';
import { useSupplierProducts } from '../../../../hooks/procurement/useProcurement';

const buildEmptyItem = () => ({
  id: '',
  producto_id: '',
  variante_id: '',
  codigo_proveedor: '',
  costo_compra: '',
  compra_minima: 1,
  tiempo_abastecimiento_dias: '',
  es_preferente: false,
  es_activo: true,
});

const normalizeItem = (item) => ({
  ...buildEmptyItem(),
  ...item,
  costo_compra: item?.costo_compra ?? '',
  compra_minima: item?.compra_minima ?? 1,
  tiempo_abastecimiento_dias: item?.tiempo_abastecimiento_dias ?? '',
});

export const SupplierProductsDialog = ({
  open,
  supplier,
  variants = [],
  saving,
  saveError,
  onClose,
  onSubmit,
}) => {
  const { items: loadedItems, loading, error } = useSupplierProducts(supplier?.id, open);

  // Se usa estado de borrador solo cuando el usuario edita.
  // Mientras no edite, la lista se deriva de la consulta para evitar sincronizar estado con useEffect.
  const [draftItems, setDraftItems] = useState(null);
  const [notice, setNotice] = useState('');
  const [removeItemIndex, setRemoveItemIndex] = useState(null);

  const items = useMemo(() => {
    return draftItems ?? (loadedItems || []).map(normalizeItem);
  }, [draftItems, loadedItems]);

  const variantById = useMemo(() => {
    return variants.reduce((acc, variant) => {
      acc[variant.id] = variant;
      return acc;
    }, {});
  }, [variants]);

  const updateItem = (index, field, value) => {
    setDraftItems((current) =>
      (current ?? items).map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        if (field === 'variante_id') {
          const selectedVariant = variantById[value];
          return {
            ...item,
            variante_id: value,
            producto_id: selectedVariant?.producto_id || item.producto_id || '',
            costo_compra: item.costo_compra || selectedVariant?.costo_compra_sugerido || selectedVariant?.costo_actual || '',
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

    setDraftItems((current) => (current ?? items).filter((_, itemIndex) => itemIndex !== removeItemIndex));
    setRemoveItemIndex(null);
  };

  const handleSubmit = async () => {
    const payload = items
      .filter((item) => item.variante_id || item.producto_id)
      .map((item) => ({
        ...item,
        costo_compra: Number(item.costo_compra || 0),
        compra_minima: Number(item.compra_minima || 1),
        tiempo_abastecimiento_dias: item.tiempo_abastecimiento_dias === '' ? null : Number(item.tiempo_abastecimiento_dias),
      }));

    await onSubmit?.({ supplierId: supplier.id, items: payload });
    setNotice('Costos por proveedor actualizados.');
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pr: 6, fontWeight: 900 }}>
        Productos y costos del proveedor
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
          <Box>
            <Typography variant="subtitle2" fontWeight={900}>
              {supplier?.razon_social || 'Proveedor'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aquí se controla el costo de compra por variante. Este costo se usará como sugerencia al crear órdenes de compra.
            </Typography>
          </Box>

          <ErrorMessage message={error || saveError} />
          {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

          <Stack spacing={1.5}>
            {items.map((item, index) => {
              const selectedVariant = variantById[item.variante_id];

              return (
                <Paper
                  key={`${item.id || 'new'}-${index}`}
                  variant="outlined"
                  sx={(theme) => ({
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                  })}
                >
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
                      noOptionsText="No se encontraron variantes"
                      sx={{ minWidth: { xs: '100%', md: 320 }, flex: 1 }}
                      renderInput={(params) => (
                        <TextField {...params} label="Variante" placeholder="Busca producto, codigo o variante" />
                      )}
                    />

                    <TextField
                      size="small"
                      label="Código proveedor"
                      value={item.codigo_proveedor || ''}
                      onChange={(event) => updateItem(index, 'codigo_proveedor', event.target.value)}
                      sx={{ width: { xs: '100%', md: 155 } }}
                    />

                    <TextField
                      size="small"
                      label="Costo unitario"
                      type="number"
                      value={item.costo_compra}
                      onChange={(event) => updateItem(index, 'costo_compra', event.target.value)}
                      sx={{ width: { xs: '100%', md: 145 } }}
                    />

                    <TextField
                      size="small"
                      label="Mínimo"
                      type="number"
                      value={item.compra_minima}
                      onChange={(event) => updateItem(index, 'compra_minima', event.target.value)}
                      sx={{ width: { xs: '100%', md: 100 } }}
                    />

                    <TextField
                      size="small"
                      label="Días abastec."
                      type="number"
                      value={item.tiempo_abastecimiento_dias}
                      onChange={(event) => updateItem(index, 'tiempo_abastecimiento_dias', event.target.value)}
                      sx={{ width: { xs: '100%', md: 135 } }}
                    />

                    <TextField
                      select
                      size="small"
                      label="Preferente"
                      value={String(Boolean(item.es_preferente))}
                      onChange={(event) => updateItem(index, 'es_preferente', event.target.value === 'true')}
                      sx={{ width: { xs: '100%', md: 130 } }}
                    >
                      <MenuItem value="false">No</MenuItem>
                      <MenuItem value="true">Sí</MenuItem>
                    </TextField>

                    <IconButton color="error" onClick={() => requestRemoveItem(index)} aria-label="Quitar producto">
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </Stack>

                  {selectedVariant && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Costo promedio actual: {formatCurrency(selectedVariant.costo_actual)}
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>

          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => setDraftItems((current) => [...(current ?? items), buildEmptyItem()])}
            sx={{ alignSelf: 'flex-start' }}
          >
            Agregar producto proveedor
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || loading}>
          Guardar costos
        </Button>
      </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={removeItemIndex !== null}
        action="delete"
        title="Quitar producto proveedor"
        message="¿Deseas quitar esta configuración de costo del proveedor?"
        confirmText="Quitar"
        onCancel={() => setRemoveItemIndex(null)}
        onConfirm={handleConfirmRemoveItem}
      />
    </>
  );
};
