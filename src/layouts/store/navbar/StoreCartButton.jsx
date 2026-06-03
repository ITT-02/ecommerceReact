/**
 * Botón de carrito de la tienda pública.
 * Muestra contador real cuando el usuario tiene sesión activa.
 */

import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { Badge, IconButton } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../../../hooks/auth/useAuth';
import { useCart } from '../../../hooks/sales/useCart';

export const StoreCartButton = () => {
  const { user, isAuthenticated } = useAuth();
  const isLoggedIn = isAuthenticated ?? Boolean(user);
  const { items } = useCart({ enabled: isLoggedIn });

  const totalItems = items.reduce((total, item) => total + Number(item.cantidad || 0), 0);

  return (
    <IconButton
      component={NavLink}
      to="/carrito"
      color="primary"
      size="small"
      aria-label={totalItems ? `Carrito con ${totalItems} producto(s)` : 'Carrito'}
    >
      <Badge badgeContent={totalItems} color="primary" invisible={!totalItems} max={99}>
        <ShoppingCartOutlinedIcon />
      </Badge>
    </IconButton>
  );
};
