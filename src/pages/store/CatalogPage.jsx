// Catálogo de tienda.
// Lista productos una sola vez; las variantes se muestran en el detalle.

import { useMemo, useState } from 'react';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, Button, Card, CardContent, CardMedia, Chip, Container, Grid, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { useStoreCatalog } from '../../hooks/store/useStoreCatalog';
import { formatCurrency } from '../../utils/formatters';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

const toBooleanFilter = (value) => {
  if (value === '') return null;
  return value === 'true';
};

const getAvailabilityLabel = (product) => {
  if (product.stock_total > 0) return 'Disponible';
  if (product.vender_sin_stock) return 'Bajo pedido';
  return 'Sin stock';
};

const getAvailabilityColor = (product) => {
  if (product.stock_total > 0) return 'success';
  if (product.vender_sin_stock) return 'warning';
  return 'default';
};

const getPriceLabel = (product) => {
  if (!product.mostrar_precio) return 'Precio a consultar';
  if (product.precio_min === null || product.precio_min === undefined) return 'Sin precio';
  if (Number(product.precio_min) === Number(product.precio_max)) return formatCurrency(product.precio_min);
  return `Desde ${formatCurrency(product.precio_min)}`;
};

export const CatalogPage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [destacado, setDestacado] = useState('');
  const [tipoCompra, setTipoCompra] = useState('');
  const [orderBy, setOrderBy] = useState('recientes');

  const { products, categories, pagination, loading, fetching, error, addToCart, adding } = useStoreCatalog({
    pageNumber,
    pageSize: 12,
    search,
    categoriaId: categoriaId || null,
    destacado: toBooleanFilter(destacado),
    tipoCompra: tipoCompra || null,
    orderBy,
  });

  const hasProducts = products.length > 0;
  const categoryOptions = useMemo(() => categories || [], [categories]);

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPageNumber(1);
  };

  const handleDirectAdd = async (product) => {
    if (!product.variante_predeterminada_id) return;
    await addToCart({ varianteId: product.variante_predeterminada_id, cantidad: 1 });
  };

  if (loading) return <LoadingScreen message="Cargando catálogo..." />;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="overline" color="primary.main">Tienda Aliqora</Typography>
          <Typography variant="h2">Catálogo</Typography>
          <Typography variant="body2" color="text.secondary">
            Productos visibles en tienda. Si un producto tiene varias variantes, el cliente elige la variante desde el detalle.
          </Typography>
        </Box>

        <ErrorMessage message={error} />

        <Card>
          <CardContent>
            <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField size="small" label="Buscar producto" value={search} onChange={handleFilterChange(setSearch)} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select size="small" label="Categoría" value={categoriaId} onChange={handleFilterChange(setCategoriaId)}>
                  <MenuItem value="">Todas</MenuItem>
                  {categoryOptions.map((category) => (
                    <MenuItem key={category.id} value={category.id}>{category.nombre}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select size="small" label="Destacado" value={destacado} onChange={handleFilterChange(setDestacado)}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="true">Destacados</MenuItem>
                  <MenuItem value="false">No destacados</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select size="small" label="Tipo compra" value={tipoCompra} onChange={handleFilterChange(setTipoCompra)}>
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="compra_directa">Compra directa</MenuItem>
                  <MenuItem value="cotizacion">Cotización</MenuItem>
                  <MenuItem value="bajo_pedido">Bajo pedido</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <TextField select size="small" label="Ordenar" value={orderBy} onChange={handleFilterChange(setOrderBy)}>
                  <MenuItem value="recientes">Recientes</MenuItem>
                  <MenuItem value="nombre_asc">Nombre A-Z</MenuItem>
                  <MenuItem value="precio_asc">Menor precio</MenuItem>
                  <MenuItem value="precio_desc">Mayor precio</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {!hasProducts ? (
          <EmptyState title="Sin productos" description="No encontramos productos con los filtros seleccionados." />
        ) : (
          <Grid container spacing={2.5}>
            {products.map((product) => {
              const canDirectAdd = product.total_variantes === 1 && product.variante_predeterminada_id && !product.requiere_cotizacion && (product.stock_total > 0 || product.vender_sin_stock);
              return (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="190"
                      image={product.imagen_principal_url || PLACEHOLDER_IMAGE}
                      alt={product.nombre}
                      sx={{ objectFit: 'cover', bgcolor: 'action.selected' }}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Stack spacing={1.25} sx={{ height: '100%' }}>
                        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                          <Chip size="small" label={getAvailabilityLabel(product)} color={getAvailabilityColor(product)} variant="outlined" />
                          {product.destacado && <Chip size="small" label="Destacado" color="primary" variant="outlined" />}
                        </Stack>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ lineHeight: 1.25 }}>{product.nombre}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{product.categoria_nombre || 'Sin categoría'}</Typography>
                        </Box>

                        <Typography variant="subtitle1" color="secondary.main" sx={{ fontWeight: 800 }}>
                          {getPriceLabel(product)}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <Button component={RouterLink} to={`/productos/${product.slug}`} variant="outlined" fullWidth startIcon={<VisibilityOutlinedIcon />}>
                            Ver
                          </Button>
                          {canDirectAdd ? (
                            <Button variant="contained" disabled={adding} onClick={() => handleDirectAdd(product)} sx={{ minWidth: 48 }} aria-label="Agregar al carrito">
                              <ShoppingCartOutlinedIcon fontSize="small" />
                            </Button>
                          ) : (
                            <Button component={RouterLink} to={`/productos/${product.slug}`} variant="contained" fullWidth startIcon={<TuneOutlinedIcon />}>
                              Opciones
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {pagination.totalPages > 1 && (
          <Stack sx={{ alignItems: 'center' }}>
            <Pagination count={pagination.totalPages} page={pageNumber} onChange={(_, page) => setPageNumber(page)} color="primary" />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Página {pagination.pageNumber} de {pagination.totalPages} · Total: {pagination.totalCount}
              {fetching ? ' · Actualizando...' : ''}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
