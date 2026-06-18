// Catálogo de tienda.
// Producción: carga paginada incremental con scroll infinito, filtros superiores y categorías visuales compactas.

import { useEffect, useMemo, useRef, useState } from 'react';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { Box, Card, CardContent, Chip, Container, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { CatalogFilterPanel } from '../../components/catalog/CatalogFilterPanel';
import { StoreProductCard } from '../../components/catalog/StoreProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useDebouncedValue } from '../../hooks/common/useDebouncedValue';
import { useStoreCatalog } from '../../hooks/store/useStoreCatalog';

const PAGE_SIZE = 12;

const DEFAULT_FILTERS = {
  searchInput: '',
  categoriaId: '',
  destacado: '',
  tipoCompra: '',
  disponibilidad: '',
  personalizable: '',
  precioMin: '',
  precioMax: '',
  orderBy: 'recientes',
};

const toBooleanFilter = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  return value === true || value === 'true';
};

const readInitialFilters = (searchParams) => ({
  ...DEFAULT_FILTERS,
  searchInput: searchParams.get('q') || '',
  categoriaId: searchParams.get('categoria') || '',
  destacado: searchParams.get('destacado') || '',
  tipoCompra: searchParams.get('tipo') || '',
  disponibilidad: searchParams.get('disponibilidad') || '',
  personalizable: searchParams.get('personalizable') || '',
  precioMin: searchParams.get('precio_min') || '',
  precioMax: searchParams.get('precio_max') || '',
  orderBy: searchParams.get('orden') || 'recientes',
});

const buildParamsFromFilters = (filters) => {
  const params = new URLSearchParams();

  if (filters.searchInput?.trim()) params.set('q', filters.searchInput.trim());
  if (filters.categoriaId) params.set('categoria', filters.categoriaId);
  if (filters.destacado) params.set('destacado', filters.destacado);
  if (filters.tipoCompra) params.set('tipo', filters.tipoCompra);
  if (filters.disponibilidad) params.set('disponibilidad', filters.disponibilidad);
  if (filters.personalizable) params.set('personalizable', filters.personalizable);
  if (filters.precioMin) params.set('precio_min', filters.precioMin);
  if (filters.precioMax) params.set('precio_max', filters.precioMax);
  if (filters.orderBy && filters.orderBy !== 'recientes') params.set('orden', filters.orderBy);

  return params;
};

const areFiltersEqual = (left, right) =>
  Object.keys(DEFAULT_FILTERS).every((key) => String(left?.[key] ?? '') === String(right?.[key] ?? ''));

const mergeProducts = (current, next) => {
  const map = new Map();
  [...current, ...next].forEach((product) => {
    if (product?.id) map.set(product.id, product);
  });
  return Array.from(map.values());
};

const areSameProductList = (left = [], right = []) => {
  if (left.length !== right.length) return false;
  return left.every((product, index) => String(product?.id || '') === String(right[index]?.id || ''));
};

const PromotionStrip = ({ promotions = [] }) => {
  if (!promotions.length) return null;

  return (
    <Card
      elevation={0}
      sx={(theme) => {
        const m = theme.palette.custom.semantic.storeMarketing;
        return {
          borderRadius: theme.palette.custom.radius.md,
          border: `1px solid ${m.lightCardBorder}`,
          bgcolor: m.accentSofter,
          backgroundImage: 'none',
        };
      }}
    >
      <CardContent sx={{ py: 1.25, '&:last-child': { pb: 1.25 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
            <LocalOfferOutlinedIcon color="primary" sx={{ fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 900 }}>
              Promociones activas
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.8} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {promotions.slice(0, 4).map((promotion) => (
              <Chip
                key={promotion.id}
                size="small"
                label={promotion.codigo ? `${promotion.nombre} · ${promotion.codigo}` : promotion.nombre}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsString = searchParams.toString();
  const lastUrlWriteRef = useRef('');
  const sentinelRef = useRef(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [filters, setFilters] = useState(() => readInitialFilters(searchParams));
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [actionError, setActionError] = useState('');
  const [addingVariantId, setAddingVariantId] = useState(null);

  const debouncedSearch = useDebouncedValue(filters.searchInput, 500);
  const selectedCategoryIds = useMemo(
    () => (filters.categoriaId ? [filters.categoriaId] : []),
    [filters.categoriaId],
  );

  const filterSignature = useMemo(
    () =>
      JSON.stringify({
        q: debouncedSearch,
        categoriaId: filters.categoriaId,
        destacado: filters.destacado,
        tipoCompra: filters.tipoCompra,
        disponibilidad: filters.disponibilidad,
        personalizable: filters.personalizable,
        precioMin: filters.precioMin,
        precioMax: filters.precioMax,
        orderBy: filters.orderBy,
      }),
    [
      debouncedSearch,
      filters.categoriaId,
      filters.destacado,
      filters.disponibilidad,
      filters.orderBy,
      filters.personalizable,
      filters.precioMax,
      filters.precioMin,
      filters.tipoCompra,
    ],
  );

  useEffect(() => {
    if (paramsString === lastUrlWriteRef.current) {
      lastUrlWriteRef.current = '';
      return;
    }

    const nextFilters = readInitialFilters(new URLSearchParams(paramsString));
    setFilters((current) => (areFiltersEqual(current, nextFilters) ? current : nextFilters));
  }, [paramsString]);

  useEffect(() => {
    if ((filters.searchInput || '') !== (debouncedSearch || '')) return;

    const nextParams = buildParamsFromFilters({
      ...filters,
      searchInput: debouncedSearch,
    });
    const nextParamsString = nextParams.toString();

    if (nextParamsString !== paramsString) {
      lastUrlWriteRef.current = nextParamsString;
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch, filterSignature, filters, paramsString, setSearchParams]);

  const {
    products,
    categories,
    promotions,
    pagination,
    loading,
    fetching,
    error,
    addToCart,
    adding,
  } = useStoreCatalog({
    pageNumber,
    pageSize: PAGE_SIZE,
    search: debouncedSearch,
    categoriaId: filters.categoriaId || null,
    categoriaIds: selectedCategoryIds,
    destacado: toBooleanFilter(filters.destacado),
    tipoCompra: filters.tipoCompra || null,
    disponibilidad: filters.disponibilidad || null,
    personalizable: toBooleanFilter(filters.personalizable),
    precioMin: filters.precioMin || null,
    precioMax: filters.precioMax || null,
    orderBy: filters.orderBy || 'recientes',
  });

  useEffect(() => {
    setPageNumber(1);
    setVisibleProducts([]);
  }, [filterSignature]);

  useEffect(() => {
    setVisibleProducts((current) => {
      const nextProducts = pageNumber === 1 ? products : mergeProducts(current, products);
      return areSameProductList(current, nextProducts) ? current : nextProducts;
    });
  }, [pageNumber, products]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !pagination.hasNextPage) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || fetching) return;

        setPageNumber((current) => {
          if (pagination.totalPages && current >= pagination.totalPages) return current;
          return current + 1;
        });
      },
      { root: null, rootMargin: '520px 0px', threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetching, pagination.hasNextPage, pagination.totalPages]);

  const handleFilterChange = (name, value) => {
    setFilters((current) => {
      if (String(current[name] ?? '') === String(value ?? '')) return current;
      return { ...current, [name]: value };
    });
  };

  const handleClearFilters = () => {
    setFilters((current) => (areFiltersEqual(current, DEFAULT_FILTERS) ? current : DEFAULT_FILTERS));
    lastUrlWriteRef.current = '';
    setSearchParams({}, { replace: true });
  };

    const handleDirectAdd = async (product) => {
      const variantId = product.variante_predeterminada_id;

      if (!variantId) return;

      setActionError('');
      setAddingVariantId(String(variantId));

      try {
        await addToCart({
          varianteId: variantId,
          cantidad: 1,
        });
      } catch (err) {
        setActionError(
          err?.response?.data?.message ||
            err.message ||
            'No se pudo agregar el producto al carrito.',
        );
      } finally {
        setAddingVariantId(null);
      }
    };

  if (loading && !visibleProducts.length) return <LoadingScreen message="Cargando catálogo..." />;

  return (
    <Box sx={(theme) => ({ bgcolor: theme.palette.custom.semantic.storeMarketing.lightBg, minHeight: '100%' })}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="primary.main">Tienda Aliqora</Typography>
            <Typography variant="h2">Catálogo</Typography>
            <Typography variant="body2" color="text.secondary">
               Productos disponibles en la tienda. Si un artículo tiene varias opciones, podrás elegir la que prefieras en el detalle.
            </Typography>
          </Box>
          <ErrorMessage message={actionError || error} />

          <CatalogFilterPanel
            categories={categories}
            values={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            searching={fetching && pageNumber === 1}
          />

          <PromotionStrip promotions={promotions} />

          {fetching && pageNumber === 1 && <LinearProgress />}

          {!visibleProducts.length && !fetching ? (
            <EmptyState title="Sin productos" description="No encontramos productos con los filtros seleccionados." />
          ) : (
            <Grid container spacing={2.5}>
              {visibleProducts.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <StoreProductCard
                    product={product}
                    adding={String(addingVariantId) === String(product.variante_predeterminada_id)}
                    onAdd={handleDirectAdd}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          <Box ref={sentinelRef} sx={{ minHeight: 44, display: 'grid', placeItems: 'center' }}>
            {pagination.hasNextPage && fetching && (
              <Stack spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
                <LinearProgress sx={{ width: { xs: '100%', sm: 360 } }} />
                <Typography variant="caption" color="text.secondary">
                  Cargando más productos...
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
