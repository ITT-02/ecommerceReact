// Resumen de pedido antes de confirmar.

import { Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

export const OrderSummary = ({ total = 0 }) => <Card><CardContent><Typography variant="h6">Resumen</Typography><Typography>Total: {formatCurrency(total)}</Typography></CardContent></Card>;
