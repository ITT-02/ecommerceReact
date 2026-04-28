// Resumen de totales del carrito.

import { Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

export const CartSummary = ({ total = 0 }) => <Card><CardContent><Typography variant="h6">Total: {formatCurrency(total)}</Typography></CardContent></Card>;
