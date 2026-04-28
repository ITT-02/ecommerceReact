// Alerta de productos con bajo stock.

import { Alert } from '@mui/material';

export const LowStockAlert = ({ count = 0 }) => <Alert severity="warning">Variantes con bajo stock: {count}</Alert>;
