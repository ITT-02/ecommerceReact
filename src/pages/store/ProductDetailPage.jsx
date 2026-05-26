// Página: Detalle de producto.

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Skeleton, Typography } from '@mui/material';

import { ProductGallery } from '../../components/catalog/ProductGallery';
import { getPublicProductDetailBySlug } from '../../services/catalog/catalogService';
import { getProductMedia } from '../../services/catalog/mediaService';
import { PLACEHOLDER_IMAGE } from '../../utils/constants';

/**
 * Extrae el ID del producto desde el objeto devuelto por la vista.
 * La vista pública puede exponer el ID bajo distintos nombres de campo
 * dependiendo de cómo esté definida en la BD. Probamos todos en orden.
 */
const extractProductId = (prod) =>
  prod?.producto_id ??  // vw_detalle_producto (convención _publico)
  prod?.id          ??  // tablas base o vistas sin prefijo
  prod?.productId   ??  // camelCase (algunos ORMs)
  null;

// ─── Hook local de carga ──────────────────────────────────────────
const useProductDetail = (slug) => {
  const [product,   setProduct]   = useState(null);
  const [media,     setMedia]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        // 1. Detalle del producto (vista pública)
        const rows = await getPublicProductDetailBySlug(slug);
        const prod = Array.isArray(rows) ? rows[0] : rows;
        if (!prod) throw new Error('Producto no encontrado');
        if (cancelled) return;
        setProduct(prod);

        // 2a. La vista puede incluir multimedia embebida directamente
        const embeddedMedia =
          prod.multimedia          ??  // posible campo JSON de la vista
          prod.producto_multimedia ??  // alias alternativo
          null;

        if (embeddedMedia && Array.isArray(embeddedMedia) && embeddedMedia.length > 0) {
          if (!cancelled) setMedia(embeddedMedia);
          return;
        }

        // 2b. Si no está embebida, la buscamos por el ID del producto
        const productId = extractProductId(prod);

        if (!productId) {
          // Sin ID no podemos buscar multimedia; la galería usará el fallback.
          if (import.meta.env.DEV) {
            console.warn(
              '[ProductDetailPage] No se encontró el ID del producto en la respuesta de la vista.',
              'Campos disponibles:', Object.keys(prod),
            );
          }
          return;
        }

        const multimediaRows = await getProductMedia(productId);
        if (!cancelled) setMedia(multimediaRows ?? []);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [slug]);

  return { product, media, loading, error };
};

// ─── Skeleton de carga ────────────────────────────────────────────
const GallerySkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
    <Skeleton variant="rounded" sx={{ width: '100%', aspectRatio: '4/3' }} />
    <Box sx={{ display: 'flex', gap: 1 }}>
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} variant="rounded" width={80} height={80} />
      ))}
    </Box>
  </Box>
);

// ─── Página principal ─────────────────────────────────────────────
export const ProductDetailPage = () => {
  const { slug }                    = useParams();
  const { product, media, loading, error } = useProductDetail(slug);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {loading && (
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Columna galería */}
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 480 } }}>
            <GallerySkeleton />
          </Box>
          {/* Columna info */}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={100} />
          </Box>
        </Box>
      )}

      {error && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">{error}</Typography>
        </Box>
      )}

      {!loading && !error && product && (
        <Box
          sx={{
            display      : 'flex',
            gap          : 4,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems   : 'flex-start',
          }}
        >
          {/* ── Galería de medios ─────────────────────────────── */}
          <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '50%' }, maxWidth: 600 }}>
            <ProductGallery
              media         = {media}
              fallbackImage = {PLACEHOLDER_IMAGE}
              productName   = {product.producto_nombre ?? product.nombre ?? ''}
              orientation   = "vertical"
            />
          </Box>

          {/* ── Información del producto ──────────────────────── */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" gutterBottom>
              {product.producto_nombre ?? product.nombre}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {product.descripcion_corta}
            </Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
};
