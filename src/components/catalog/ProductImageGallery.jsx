// Galería de imágenes para detalle de producto.

import { Box } from '@mui/material';

export const ProductImageGallery = ({ images = [] }) => {
  const mainImage = images[0];
  return <Box component="img" src={mainImage} alt="Producto" sx={{ width: '100%', borderRadius: 3, display: mainImage ? 'block' : 'none' }} />;
};
