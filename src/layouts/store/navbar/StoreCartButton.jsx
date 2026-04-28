/**
 * Botón de carrito de la tienda pública.
 */

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { IconButton } from '@mui/material';
import { NavLink } from 'react-router-dom';

export const StoreCartButton = () => {
  return (
    <IconButton
      component={NavLink}
      to="/carrito"
      color="primary"
      size="small"
      aria-label="Carrito"
    >
      <ShoppingCartOutlinedIcon />
    </IconButton>
  );
};
