// Carrito de compras del cliente.
// cantidad editable, con botones +/-, guardado automático con debounce
// y estados de carga por item para evitar renderizados visuales globales.

import { memo, useCallback, useEffect, useRef, useState } from 'react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';

import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { alpha } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useCart } from '../../hooks/sales/useCart';
import { formatCurrency } from '../../utils/formatters';

const PLACEHOLDER_IMAGE = 'https://placehold.co/160x120?text=Aliqora';
const QUANTITY_SAVE_DELAY = 650;

const sanitizeQuantityInput = (value = '') => {
  return String(value || '').replace(/\D/g, '');
};

const parseQuantity = (value, fallback = 1) => {
  const quantity = Number(value);

  if (!Number.isFinite(quantity) || quantity < 1) return fallback;

  return Math.floor(quantity);
};

const QuantityControl = ({
  value,
  disabled,
  onChange,
  onCommit,
  onCancel,
  onDecrease,
  onIncrease,
}) => {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      sx={(theme) => ({
        alignItems: 'center',
        p: 0.35,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.palette.custom.radius.xs,
        bgcolor: alpha(theme.palette.background.paper, 0.86),
        width: { xs: '100%', sm: 152 },
      })}
    >
      <IconButton
        size="small"
        onClick={onDecrease}
        disabled={disabled}
        aria-label="Disminuir cantidad"
        sx={(theme) => ({
          borderRadius: theme.palette.custom.radius.xs,
        })}
      >
        <RemoveRoundedIcon fontSize="small" />
      </IconButton>

      <TextField
        value={value}
        onChange={onChange}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }

          if (event.key === 'Escape') {
            event.preventDefault();
            onCancel();
            event.currentTarget.blur();
          }
        }}
        disabled={disabled}
        size="small"
        variant="standard"
        slotProps={{
          input: {
            disableUnderline: true,
          },
          htmlInput: {
            inputMode: 'numeric',
            pattern: '[0-9]*',
            min: 1,
            'aria-label': 'Cantidad',
          },
        }}
        sx={{
          flex: 1,
          minWidth: 0,
          '& input': {
            textAlign: 'center',
            fontWeight: 850,
            px: 0.5,
          },
        }}
      />

      <IconButton
        size="small"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Aumentar cantidad"
        sx={(theme) => ({
          borderRadius: theme.palette.custom.radius.xs,
        })}
      >
        <AddRoundedIcon fontSize="small" />
      </IconButton>
    </Stack>
  );
};

const CartItemCard = memo(({ item, onUpdateItem, onAskRemove, isRemoving }) => {
  const savedQuantity = Number(item.cantidad || 1);

  const saveTimerRef = useRef(null);
  const mountedRef = useRef(true);

  const [draftQuantity, setDraftQuantity] = useState(String(savedQuantity));
  const [isUpdating, setIsUpdating] = useState(false);
  const [localError, setLocalError] = useState('');

  const isBusy = isUpdating || isRemoving;

  const clearSaveTimer = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      clearSaveTimer();
    };
  }, [clearSaveTimer]);

  useEffect(() => {
    setDraftQuantity(String(savedQuantity));
  }, [item.id, savedQuantity]);

  const commitQuantity = useCallback(
    async (rawValue, { resetOnInvalid = true } = {}) => {
      if (isBusy) return;

      clearSaveTimer();

      const cleanValue = sanitizeQuantityInput(rawValue);

      if (!cleanValue) {
        if (resetOnInvalid) setDraftQuantity(String(savedQuantity));
        return;
      }

      const nextQuantity = parseQuantity(cleanValue, savedQuantity);

      if (nextQuantity === savedQuantity) {
        setDraftQuantity(String(savedQuantity));
        return;
      }

      setIsUpdating(true);
      setLocalError('');

      try {
        await onUpdateItem(item.id, nextQuantity);

        if (mountedRef.current) {
          setDraftQuantity(String(nextQuantity));
        }
      } catch (err) {
        if (mountedRef.current) {
          setLocalError(
            err?.response?.data?.message ||
              err.message ||
              'No se pudo actualizar la cantidad.',
          );
          setDraftQuantity(String(savedQuantity));
        }
      } finally {
        if (mountedRef.current) {
          setIsUpdating(false);
        }
      }
    },
    [clearSaveTimer, isBusy, item.id, onUpdateItem, savedQuantity],
  );

  const scheduleQuantitySave = useCallback(
    (nextValue) => {
      clearSaveTimer();

      const cleanValue = sanitizeQuantityInput(nextValue);

      if (!cleanValue) return;

      const nextQuantity = parseQuantity(cleanValue, savedQuantity);

      if (nextQuantity === savedQuantity) return;

      saveTimerRef.current = setTimeout(() => {
        void commitQuantity(cleanValue, { resetOnInvalid: false });
      }, QUANTITY_SAVE_DELAY);
    },
    [clearSaveTimer, commitQuantity, savedQuantity],
  );

  const handleQuantityChange = (event) => {
    const nextValue = sanitizeQuantityInput(event.target.value);

    setDraftQuantity(nextValue);
    setLocalError('');
    scheduleQuantitySave(nextValue);
  };

  const handleCancelQuantity = () => {
    clearSaveTimer();
    setDraftQuantity(String(savedQuantity));
    setLocalError('');
  };

  const handleDecrease = () => {
    if (isBusy) return;

    const nextQuantity = Math.max(1, parseQuantity(draftQuantity, savedQuantity) - 1);

    setDraftQuantity(String(nextQuantity));
    void commitQuantity(String(nextQuantity));
  };

  const handleIncrease = () => {
    if (isBusy) return;

    const nextQuantity = parseQuantity(draftQuantity, savedQuantity) + 1;

    setDraftQuantity(String(nextQuantity));
    void commitQuantity(String(nextQuantity));
  };

  return (
    <Card
      variant="outlined"
      sx={(theme) => ({
        borderRadius: theme.palette.custom.radius.xs,
        backgroundImage: 'none',
        transition: `box-shadow ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
        '&:hover': {
          boxShadow: theme.palette.custom.shadows.sm,
        },
      })}
    >
      <CardContent
        sx={{
          p: { xs: 2, md: 2.25 },
          '&:last-child': {
            pb: { xs: 2, md: 2.25 },
          },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Box
            component="img"
            src={item.imagen_url || PLACEHOLDER_IMAGE}
            alt={item.nombre_producto}
            onError={(event) => {
              event.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
            sx={(theme) => ({
              width: { xs: '100%', sm: 112 },
              height: 92,
              objectFit: 'cover',
              borderRadius: theme.palette.custom.radius.xs,
              bgcolor: 'action.selected',
              flexShrink: 0,
            })}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 850,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: { xs: 'normal', md: 'nowrap' },
              }}
            >
              {item.nombre_producto}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {item.nombre_variante || item.codigoproducto}
            </Typography>

            {item.requiere_abastecimiento && (
              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.35 }}>
                Preparación bajo pedido
              </Typography>
            )}

            {localError && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                {localError}
              </Typography>
            )}

            {isUpdating && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Actualizando cantidad...
              </Typography>
            )}
          </Box>

          <QuantityControl
            value={draftQuantity}
            disabled={isBusy}
            onChange={handleQuantityChange}
            onCommit={() => commitQuantity(draftQuantity)}
            onCancel={handleCancelQuantity}
            onDecrease={handleDecrease}
            onIncrease={handleIncrease}
          />

          <Typography
            variant="subtitle1"
            sx={{
              minWidth: { sm: 105 },
              textAlign: { xs: 'left', sm: 'right' },
              fontWeight: 900,
            }}
          >
            {formatCurrency(item.total_linea)}
          </Typography>

          <IconButton
            color="error"
            onClick={() => onAskRemove(item)}
            disabled={isBusy}
            aria-label="Eliminar item"
            sx={(theme) => ({
              alignSelf: { xs: 'flex-end', sm: 'center' },
              borderRadius: theme.palette.custom.radius.xs,
            })}
          >
            <DeleteOutlineOutlinedIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
});

CartItemCard.displayName = 'CartItemCard';

export const CartPage = () => {
  const { cart, items, loading, saving, error, updateItem, removeItem } = useCart();

  const [itemToRemove, setItemToRemove] = useState(null);
  const [removingItemId, setRemovingItemId] = useState(null);

  if (loading) return <LoadingScreen message="Cargando carrito..." />;

  const handleConfirmRemove = async () => {
    if (!itemToRemove?.id) return;

    setRemovingItemId(itemToRemove.id);

    try {
      await removeItem(itemToRemove.id);
      setItemToRemove(null);
    } finally {
      setRemovingItemId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main">
            Compra
          </Typography>

          <Typography variant="h2">
            Carrito
          </Typography>
        </Box>

        <ErrorMessage message={error} />

        {!items.length ? (
          <EmptyState
            title="Tu carrito está vacío"
            description="Agrega productos desde el catálogo para continuar."
            actionLabel="Ver catálogo"
            actionTo="/catalogo"
          />
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={1.5}>
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onUpdateItem={updateItem}
                    onAskRemove={setItemToRemove}
                    isRemoving={String(removingItemId) === String(item.id)}
                  />
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                variant="outlined"
                sx={(theme) => ({
                  position: { md: 'sticky' },
                  top: 96,
                  borderRadius: theme.palette.custom.radius.xs,
                  backgroundImage: 'none',
                })}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h5">
                      Resumen
                    </Typography>

                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">
                        Subtotal
                      </Typography>

                      <Typography fontWeight={800}>
                        {formatCurrency(cart.subtotal)}
                      </Typography>
                    </Stack>

                    <Divider />

                    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                      <Typography variant="h6">
                        Total
                      </Typography>

                      <Typography variant="h6" color="secondary.main">
                        {formatCurrency(cart.total)}
                      </Typography>
                    </Stack>

                    <Button
                      component={RouterLink}
                      to="/checkout"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={saving || Boolean(removingItemId)}
                    >
                      Continuar checkout
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Stack>

      <ConfirmDialog
        open={Boolean(itemToRemove)}
        action="delete"
        title="Eliminar del carrito"
        message={
          itemToRemove
            ? `¿Deseas quitar ${itemToRemove.nombre_producto || 'este producto'} del carrito?`
            : '¿Deseas quitar este producto del carrito?'
        }
        confirmText="Quitar"
        loading={String(removingItemId) === String(itemToRemove?.id)}
        onCancel={() => {
          if (!removingItemId) setItemToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
      />
    </Container>
  );
};