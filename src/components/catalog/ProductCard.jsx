// Tarjeta de producto para catálogo público.

import { Card, CardContent, CardMedia, Stack, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { PriceLabel } from './PriceLabel';

export const ProductCard = ({ product }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {product.portada_url && <CardMedia component="img" height="180" image={product.portada_url} alt={product.producto_nombre} />}
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1}>
          <Typography variant="h6">{product.producto_nombre}</Typography>
          <Typography variant="body2" color="text.secondary">{product.categoria_nombre}</Typography>
          <Typography variant="body2">{product.etiqueta_medida || product.nombre_variante}</Typography>
          <PriceLabel value={product.precio} />
          <Button component={Link} to={`/productos/${product.producto_slug}`} variant="outlined">Ver detalle</Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
