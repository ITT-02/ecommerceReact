// Etiqueta para mostrar precios.

import { Typography } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

export const PriceLabel = ({ value }) => {
  return <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 700 }}>{formatCurrency(value)}</Typography>;
};
