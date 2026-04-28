// Grilla de productos del catálogo.

import { Grid } from '@mui/material';
import { ProductCard } from './ProductCard';

export const ProductGrid = ({ products = [] }) => {
  return (
    <Grid container spacing={2}>
      {products.map((product) => (
        <Grid key={product.variante_id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
};
