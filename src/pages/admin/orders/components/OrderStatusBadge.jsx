import { Chip } from '@mui/material';

import {
  ORDER_STATUS_COLOR,
  PAYMENT_STATUS_COLOR,
  getOrderStatusLabel,
  getPaymentStatusLabel,
} from '../../../../adapters/orderAdapter';

export const OrderStatusBadge = ({ type = 'order', value }) => {
  const colorMap = type === 'payment' ? PAYMENT_STATUS_COLOR : ORDER_STATUS_COLOR;
  const label = type === 'payment' ? getPaymentStatusLabel(value) : getOrderStatusLabel(value);

  return (
    <Chip
      size="small"
      label={label}
      color={colorMap[value] || 'default'}
      variant="outlined"
      sx={{ fontWeight: 800 }}
    />
  );
};
