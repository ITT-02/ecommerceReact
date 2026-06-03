// Detalle de producto de tienda.
// Soporta compra directa, bajo pedido y solicitud de cotización.

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ProductGallery } from '../../components/catalog/ProductGallery';
import { ProductVariantOptions } from '../../components/catalog/ProductVariantOptions';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useStoreProductDetail } from '../../hooks/store/useStoreCatalog';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import {
  buildAttributeGroupsFromVariants,
  clearSelection,
  findVariantBySelection,
  getDefaultVariant,
  getSelectableAttributeGroups,
  getVariantAttributes,
  getVariantLabel,
  isVariantActive,
  toggleOptionInSelection,
} from '../../utils/store/variantSelection';


const getAvailabilityLabel = ({ variant, product, requiresQuote, requestedQuantity = 1 }) => {
  if (!variant) return 'Selecciona una opción';
  if (requiresQuote) return 'Requiere cotización';

  const stock = Number(variant.stock_total ?? variant.stock_actual ?? 0);
  const quantity = Math.max(1, Number(requestedQuantity) || 1);

  if (stock >= quantity) return 'Disponible';
  if (product?.vender_sin_stock) {
    return stock > 0 ? `Stock parcial: ${stock}. Resto bajo pedido` : 'Bajo pedido';
  }

  return 'Sin stock suficiente';
};

const getAvailabilityColor = ({ variant, product, requiresQuote, requestedQuantity = 1 }) => {
  if (!variant) return 'default';
  if (requiresQuote) return 'info';

  const stock = Number(variant.stock_total ?? variant.stock_actual ?? 0);
  const quantity = Math.max(1, Number(requestedQuantity) || 1);

  if (stock >= quantity) return 'success';
  if (product?.vender_sin_stock) return 'warning';
  return 'default';
};

/**
 * Obtiene el identificador real de una variante.
 * Algunas respuestas de RPC pueden venir como id o como variante_id.
 */
const getVariantId = (variant) =>
  variant?.id ??
  variant?.variante_id ??
  variant?.producto_variante_id ??
  null;

/**
 * Obtiene el ID de variante asociado a un archivo multimedia.
 * Si retorna null, significa que la imagen/video es general del producto.
 */
const getMediaVariantId = (media) =>
  media?.variante_id ??
  media?.variant_id ??
  media?.producto_variante_id ??
  media?.product_variant_id ??
  null;

/**
 * Obtiene la URL de un medio sin acoplar la galería al nombre exacto del campo.
 */
const getMediaSource = (media) =>
  media?.url_archivo ??
  media?.url ??
  media?.src ??
  '';

/**
 * Ordena la multimedia priorizando portada y luego orden visual.
 */
const sortMediaItems = (items = []) => {
  return [...items].sort((a, b) => {
    const coverDiff = Number(Boolean(b?.es_portada)) - Number(Boolean(a?.es_portada));
    if (coverDiff !== 0) return coverDiff;

    const orderA = Number(a?.orden_visual ?? a?.orden ?? 999);
    const orderB = Number(b?.orden_visual ?? b?.orden ?? 999);

    return orderA - orderB;
  });
};

/**
 * Une grupos de multimedia evitando duplicados.
 */
const mergeMediaWithoutDuplicates = (...groups) => {
  const seen = new Set();

  return groups.flat().filter((item) => {
    const src = getMediaSource(item);
    const key = item?.id ? `id:${item.id}` : `src:${src}`;

    if (!src || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
};

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [selectedOptions, setSelectedOptions] = useState({});
  const [fallbackVariantId, setFallbackVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState('');

  const { product, loading, error, adding, addToCart } = useStoreProductDetail(slug);

  const activeVariants = useMemo(() => {
    return (product?.variantes || []).filter(isVariantActive);
  }, [product?.variantes]);

  const attributeGroups = useMemo(() => {
    return buildAttributeGroupsFromVariants(activeVariants);
  }, [activeVariants]);

  const selectableGroups = useMemo(() => {
    return getSelectableAttributeGroups(attributeGroups);
  }, [attributeGroups]);

  const defaultVariant = useMemo(() => {
    return getDefaultVariant(activeVariants);
  }, [activeVariants]);

  useEffect(() => {
    setSelectedOptions(clearSelection());
    setFallbackVariantId('');
    setQuantity(1);
    setNotice('');
  }, [product?.id]);

  const selectedVariant = useMemo(() => {
    if (!activeVariants.length) return null;

    const variantByOptions = findVariantBySelection(
      activeVariants,
      selectedOptions,
      selectableGroups
    );

    if (variantByOptions) return variantByOptions;

    if (fallbackVariantId) {
      return activeVariants.find((variant) => String(getVariantId(variant)) === String(fallbackVariantId)) || null;
    }

    return null;
  }, [activeVariants, selectedOptions, selectableGroups, fallbackVariantId]);

  const previewVariant = selectedVariant || defaultVariant;

  const galleryMedia = useMemo(() => {
    const productMedia = Array.isArray(product?.multimedia) ? product.multimedia : [];
    const variantNestedMedia = Array.isArray(previewVariant?.multimedia)
      ? previewVariant.multimedia
      : [];

    const previewVariantId = getVariantId(previewVariant);

    const variantMediaFromProduct = previewVariantId
      ? productMedia.filter((item) => String(getMediaVariantId(item) || '') === String(previewVariantId))
      : [];

    const generalProductMedia = productMedia.filter((item) => !getMediaVariantId(item));
    const hasVariantMedia = variantNestedMedia.length > 0 || variantMediaFromProduct.length > 0;

    // Cuando la variante tiene multimedia propia, se coloca primero.
    // Así la imagen principal cambia inmediatamente al seleccionar color/medida.
    if (hasVariantMedia) {
      return mergeMediaWithoutDuplicates(
        sortMediaItems(variantNestedMedia),
        sortMediaItems(variantMediaFromProduct),
        sortMediaItems(generalProductMedia),
      );
    }

    // Si la variante seleccionada no tiene multimedia asociada,
    // se mantiene la galería general del producto.
    return mergeMediaWithoutDuplicates(
      sortMediaItems(generalProductMedia),
      sortMediaItems(productMedia),
    );
  }, [product?.multimedia, previewVariant]);

  const selectedStock = Number(selectedVariant?.stock_total ?? selectedVariant?.stock_actual ?? 0);
  const selectedPrice = Number(selectedVariant?.precio ?? 0);
  const requestedQuantity = Math.max(1, Number(quantity) || 1);

  const hasVisiblePrice = Boolean(product?.mostrar_precio) && selectedPrice > 0;

  const requiresQuote =
    Boolean(product?.requiere_cotizacion) ||
    !hasVisiblePrice;

  const hasEnoughStock = selectedStock >= requestedQuantity;

  const isBackorder =
    Boolean(selectedVariant) &&
    !requiresQuote &&
    !hasEnoughStock &&
    Boolean(product?.vender_sin_stock);

  const canAddToCart =
    Boolean(selectedVariant) &&
    !requiresQuote &&
    (hasEnoughStock || Boolean(product?.vender_sin_stock));

  const canRequestQuote = Boolean(selectedVariant) && requiresQuote;

  const personalizationOptions = product?.personalizacion_opciones || [];

  const canRequestPersonalization =
    Boolean(product?.es_personalizable) && personalizationOptions.length > 0 && Boolean(selectedVariant);

  const handleToggleOption = (group, option) => {
    setFallbackVariantId('');

    setSelectedOptions((current) =>
      toggleOptionInSelection({
        currentSelection: current,
        groupKey: group.key,
        optionValue: option.key,
      })
    );
  };

  const handleClearSelection = () => {
    setFallbackVariantId('');
    setSelectedOptions(clearSelection());
  };

  const handleSelectVariantFallback = (variant) => {
    setFallbackVariantId(getVariantId(variant) || '');

    const nextSelection = {};

    getVariantAttributes(variant).forEach((attribute) => {
      if (attribute?.atributo_id && attribute?.atributo_valor_id) {
        nextSelection[attribute.atributo_id] = attribute.atributo_valor_id;
      }
    });

    setSelectedOptions(nextSelection);
  };

  const handleAdd = async () => {
    if (!selectedVariant) return;

    await addToCart({
      varianteId: getVariantId(selectedVariant),
      cantidad: Number(quantity) || 1,
    });

    setNotice(
      isBackorder
        ? 'Producto agregado como compra bajo pedido.'
        : 'Producto agregado al carrito.'
    );
  };

  const handleRequestQuote = (tipoSolicitud = 'cotizacion') => {
    if (!selectedVariant) return;

    navigate(`/cotizacion/${product.slug}`, {
      state: {
        producto_id: product.id,
        producto_nombre: product.nombre,
        variante_id: getVariantId(selectedVariant),
        nombre_variante: selectedVariant.nombre_variante,
        codigoproducto: selectedVariant.codigoproducto,
        cantidad: requestedQuantity,
        tipoSolicitud,
      },
    });
  };

  if (loading) return <LoadingScreen message="Cargando producto..." />;

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <ErrorMessage message={error || 'Producto no encontrado.'} />
        <Button startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate('/catalogo')}>
          Volver al catálogo
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Button
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate('/catalogo')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver al catálogo
        </Button>

        <ErrorMessage message={error} />

        {notice && (
          <Alert severity="success" onClose={() => setNotice('')}>
            {notice}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: { md: 96 },
              }}
            >
              <ProductGallery
                key={`${product.id || product.slug}-${getVariantId(previewVariant) || 'general'}`}
                media={galleryMedia}
                fallbackImage={product.imagen_principal_url || PLACEHOLDER_IMAGE}
                productName={product.nombre}
                orientation="vertical"
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={(theme) => ({
                border: `1px solid ${theme.palette.custom.semantic.borderStrong}`,
                boxShadow: theme.palette.custom.shadows.sm,
              })}
            >
              <CardContent>
                <Stack spacing={2.5}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                    <Chip label={product.categoria_nombre || 'Producto'} variant="outlined" />
                    {product.destacado && <Chip label="Destacado" color="primary" variant="outlined" />}
                    {product.vender_sin_stock && <Chip label="Venta bajo pedido" color="warning" variant="outlined" />}
                    {product.requiere_cotizacion && <Chip label="Cotización" color="info" variant="outlined" />}
                    {personalizationOptions.length > 0 && <Chip label="Opciones de personalización" color="secondary" variant="outlined" />}
                  </Stack>

                  <Box>
                    <Typography variant="h2" sx={{ fontSize: { xs: 34, md: 48 } }}>
                      {product.nombre}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      {product.descripcion_corta}
                    </Typography>
                  </Box>

                  <Divider />

                  <ProductVariantOptions
                    product={product}
                    variants={activeVariants}
                    attributeGroups={attributeGroups}
                    selectedOptions={selectedOptions}
                    selectedVariant={selectedVariant}
                    onToggleOption={handleToggleOption}
                    onClearSelection={handleClearSelection}
                    onSelectVariantFallback={handleSelectVariantFallback}
                    showFixedGroups
                    showSelectedVariantFeatures
                  />

                  {selectedVariant ? (
                    <Card
                      sx={(theme) => ({
                        border: `1px solid ${theme.palette.custom.semantic.borderStrong}`,
                        bgcolor: theme.palette.custom.semantic.paperWarm,
                        boxShadow: 'none',
                      })}
                    >
                      <CardContent>
                        <Stack spacing={1.25}>
                          <Typography variant="subtitle1" fontWeight={800}>
                            {getVariantLabel(selectedVariant)}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            Código: {selectedVariant.codigoproducto || 'Sin código'}
                          </Typography>

                          <Typography variant="h5" color="secondary.main">
                            {hasVisiblePrice ? formatCurrency(selectedVariant.precio) : 'Precio a cotizar'}
                          </Typography>

                          <Chip
                            size="small"
                            label={getAvailabilityLabel({ variant: selectedVariant, product, requiresQuote, requestedQuantity })}
                            color={getAvailabilityColor({ variant: selectedVariant, product, requiresQuote, requestedQuantity })}
                            variant="outlined"
                            sx={{ alignSelf: 'flex-start' }}
                          />

                          {getVariantAttributes(selectedVariant).length > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              {getVariantAttributes(selectedVariant)
                                .map((item) => `${item.atributo_nombre || 'Atributo'}: ${item.valor}`)
                                .join(' · ')}
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ) : (
                    <Alert severity="info">
                      Selecciona las opciones disponibles para continuar.
                    </Alert>
                  )}

                  {personalizationOptions.length > 0 && (
                    <Alert severity="info">
                      Producto personalizable. Opciones disponibles: {personalizationOptions.map((option) => option.nombre).join(', ')}.
                    </Alert>
                  )}

                  {isBackorder && (
                    <Alert severity="warning">
                      La cantidad solicitada supera el stock disponible. Puedes comprarlo como bajo pedido; al aprobarse el pago, el pedido pasará a abastecimiento y no debe intentar reservar inventario inexistente.
                    </Alert>
                  )}

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                    <TextField
                      label="Cantidad"
                      type="number"
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value || 1)))}
                      sx={{ maxWidth: { sm: 150 } }}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />

                    <Button
                      variant="contained"
                      size="large"
                      disabled={requiresQuote ? !canRequestQuote : !canAddToCart || adding}
                      startIcon={requiresQuote ? <RequestQuoteOutlinedIcon /> : <ShoppingCartOutlinedIcon />}
                      onClick={requiresQuote ? () => handleRequestQuote('cotizacion') : handleAdd}
                      fullWidth
                    >
                      {requiresQuote
                        ? selectedVariant
                          ? 'Solicitar cotización'
                          : 'Selecciona una opción para cotizar'
                        : canAddToCart
                          ? isBackorder
                            ? 'Agregar bajo pedido'
                            : 'Agregar al carrito'
                          : 'Selecciona una opción'}
                    </Button>

                    {!requiresQuote && personalizationOptions.length > 0 && (
                      <Button
                        variant="outlined"
                        size="large"
                        disabled={!canRequestPersonalization}
                        startIcon={<RequestQuoteOutlinedIcon />}
                        onClick={() => handleRequestQuote('personalizacion')}
                        fullWidth
                      >
                        {selectedVariant
                          ? 'Personalizar / cotizar'
                          : 'Selecciona una opción para personalizar'}
                      </Button>
                    )}
                  </Stack>

                  {product.descripcion_larga && (
                    <Typography variant="body2" color="text.secondary">
                      {product.descripcion_larga}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
};