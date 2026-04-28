// Item visual dentro del carrito.

import { Card, CardContent, Typography } from '@mui/material';

export const CartItem = ({ item }) => <Card><CardContent><Typography>{item?.nombre_producto || 'Producto en carrito'}</Typography></CardContent></Card>;
