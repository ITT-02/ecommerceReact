// Tarjeta de producto para catálogo público.

import { Card, CardContent, CardMedia, Stack, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { PriceLabel } from './PriceLabel';

export const ProductCard = ({ product }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (theme) => theme.palette.custom.shadows.md,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {product.portada_url ? (
        <CardMedia
          component="img"
          height="190"
          image={product.portada_url}
          alt={product.producto_nombre}
          sx={{ objectFit: 'cover', bgcolor: 'background.default' }}
        />
      ) : (
        <Box
          sx={(theme) => ({
            height: 190,
            display: 'grid',
            placeItems: 'center',
            bgcolor: theme.palette.custom.semantic.paperWarm,
            color: 'text.secondary',
          })}
        >
          Sin imagen
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.1} sx={{ height: '100%' }}>
          <Typography variant="h6" sx={{ lineHeight: 1.35 }}>
            {product.producto_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            {product.categoria_nombre}
          </Typography>
          <Typography variant="body2">{product.etiqueta_medida || product.nombre_variante}</Typography>
          <PriceLabel value={product.precio} />
          <Box sx={{ flexGrow: 1 }} />
          <Button component={Link} to={`/productos/${product.producto_slug}`} variant="outlined" fullWidth>
            Ver detalle
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
