import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, Button, Card, CardContent, CardMedia, Chip, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const getAvailabilityLabel = (product) => {
  if (Number(product.stock_total || 0) > 0) return 'Disponible';
  if (product.vender_sin_stock) return 'Bajo pedido';
  return 'Sin stock';
};

const getAvailabilityColor = (product) => {
  if (Number(product.stock_total || 0) > 0) return 'success';
  if (product.vender_sin_stock) return 'warning';
  return 'default';
};

const getPriceLabel = (product) => {
  if (!product.mostrar_precio) return 'Precio a consultar';
  if (product.precio_min === null || product.precio_min === undefined) return 'Sin precio';
  if (Number(product.precio_min) === Number(product.precio_max)) return formatCurrency(product.precio_min);
  return `Desde ${formatCurrency(product.precio_min)}`;
};

const getPrimaryAction = (product) => {
  const canDirectAdd =
    Number(product.total_variantes || 0) === 1 &&
    product.variante_predeterminada_id &&
    !product.requiere_cotizacion &&
    (Number(product.stock_total || 0) > 0 || product.vender_sin_stock);

  if (canDirectAdd) {
    return { type: 'add', label: 'Agregar', icon: <ShoppingCartOutlinedIcon fontSize="small" /> };
  }

  if (product.requiere_cotizacion || product.es_personalizable || !product.mostrar_precio) {
    return {
      type: 'quote',
      label: 'Cotizar',
      icon: <RequestQuoteOutlinedIcon fontSize="small" />,
      to: `/cotizacion/${product.slug}`,
    };
  }

  return {
    type: 'options',
    label: 'Ver opciones',
    icon: <TuneOutlinedIcon fontSize="small" />,
    to: `/productos/${product.slug}`,
  };
};

export const StoreProductCard = ({ product, adding = false, onAdd }) => {
  const primaryAction = getPrimaryAction(product);

  return (
    <Card
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;
        return {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: `1px solid ${m.lightCardBorder}`,
          boxShadow: theme.palette.custom.shadows.sm,
          transition: `transform ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}, box-shadow ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}, border-color ${theme.palette.custom.motion.durationBase} ${theme.palette.custom.motion.easeOut}`,
          '&:hover': {
            borderColor: m.lightAccent,
            boxShadow: theme.palette.custom.shadows.md,
            transform: 'translateY(-4px)',
          },
        };
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="210"
          image={product.imagen_principal_url || PLACEHOLDER_IMAGE}
          alt={product.nombre}
          sx={(theme) => ({
            objectFit: 'cover',
            bgcolor: theme.palette.custom.semantic.paperDeep,
            borderBottom: `1px solid ${theme.palette.custom.semantic.border}`,
          })}
        />

        <Stack direction="row" spacing={0.75} sx={{ position: 'absolute', left: 12, top: 12, flexWrap: 'wrap' }}>
          <Chip size="small" label={getAvailabilityLabel(product)} color={getAvailabilityColor(product)} sx={{ backdropFilter: 'blur(8px)' }} />
          {product.destacado && <Chip size="small" label="Destacado" color="primary" sx={{ backdropFilter: 'blur(8px)' }} />}
        </Stack>
      </Box>

      <CardContent sx={{ flex: 1, p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Stack spacing={1.35} sx={{ height: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.32, fontSize: '1rem' }}>
              {product.nombre}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {product.categoria_nombre || 'Sin categoría'}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
            {product.es_personalizable && <Chip size="small" label="Personalizable" variant="outlined" color="secondary" />}
            {product.vender_sin_stock && <Chip size="small" label="Bajo pedido" variant="outlined" color="warning" />}
            {Number(product.total_variantes || 0) > 1 && <Chip size="small" label={`${product.total_variantes} variantes`} variant="outlined" />}
          </Stack>

          <Typography
            variant="subtitle1"
            sx={(theme) => ({
              fontWeight: 900,
              color: theme.palette.custom.semantic.storeMarketing.lightAccent,
            })}
          >
            {getPriceLabel(product)}
          </Typography>

          {primaryAction.type === 'options' ? (
            <Button
              component={RouterLink}
              to={primaryAction.to}
              variant="contained"
              size="small"
              fullWidth
              startIcon={primaryAction.icon}
              endIcon={<ArrowForwardRoundedIcon fontSize="small" />}
            >
              {primaryAction.label}
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                component={RouterLink}
                to={`/productos/${product.slug}`}
                variant="outlined"
                size="small"
                fullWidth
                startIcon={<VisibilityOutlinedIcon fontSize="small" />}
              >
                Ver
              </Button>

              {primaryAction.type === 'add' ? (
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  disabled={adding}
                  startIcon={primaryAction.icon}
                  onClick={() => onAdd?.(product)}
                >
                  {primaryAction.label}
                </Button>
              ) : (
                <Button
                  component={RouterLink}
                  to={primaryAction.to}
                  variant="contained"
                  size="small"
                  fullWidth
                  startIcon={primaryAction.icon}
                >
                  {primaryAction.label}
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
